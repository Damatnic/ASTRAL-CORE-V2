/**
 * Authorization Module for Mental Health Platform
 * Role-Based Access Control (RBAC) with HIPAA compliance
 */

import { Request, Response, NextFunction } from 'express';
import { SecurityLogger } from './logging/security-logger';

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  conditions?: any;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
  inherits?: string[];
}

export interface UserAuthorization {
  userId: string;
  roles: string[];
  permissions: string[];
  restrictions?: any;
}

export class AuthorizationService {
  private logger: SecurityLogger;
  private roles: Map<string, Role> = new Map();
  private permissions: Map<string, Permission> = new Map();
  private userAuthorizations: Map<string, UserAuthorization> = new Map();

  constructor() {
    this.logger = new SecurityLogger();
    this.initializeDefaultRoles();
    this.initializeDefaultPermissions();
  }

  /**
   * Initialize default roles for mental health platform
   */
  private initializeDefaultRoles(): void {
    const defaultRoles: Role[] = [
      {
        id: 'super_admin',
        name: 'Super Administrator',
        permissions: ['*'] // All permissions
      },
      {
        id: 'admin',
        name: 'Administrator',
        permissions: [
          'users.read', 'users.write', 'users.delete',
          'crisis.read', 'crisis.write',
          'volunteers.read', 'volunteers.write',
          'analytics.read',
          'audit.read'
        ]
      },
      {
        id: 'crisis_coordinator',
        name: 'Crisis Coordinator',
        permissions: [
          'crisis.read', 'crisis.write', 'crisis.escalate',
          'volunteers.read', 'volunteers.assign',
          'emergency.trigger'
        ]
      },
      {
        id: 'volunteer',
        name: 'Crisis Volunteer',
        permissions: [
          'crisis.respond', 'crisis.chat',
          'users.support',
          'tether.create', 'tether.maintain'
        ]
      },
      {
        id: 'therapist',
        name: 'Licensed Therapist',
        permissions: [
          'crisis.respond', 'crisis.chat', 'crisis.escalate',
          'users.support', 'users.therapy',
          'tether.create', 'tether.maintain',
          'emergency.assess'
        ]
      },
      {
        id: 'user',
        name: 'Regular User',
        permissions: [
          'crisis.seek_help', 'crisis.chat',
          'tether.request', 'tether.participate',
          'profile.read', 'profile.write'
        ]
      },
      {
        id: 'anonymous',
        name: 'Anonymous User',
        permissions: [
          'crisis.seek_help', 'crisis.anonymous_chat',
          'emergency.call'
        ]
      }
    ];

    defaultRoles.forEach(role => {
      this.roles.set(role.id, role);
    });
  }

  /**
   * Initialize default permissions
   */
  private initializeDefaultPermissions(): void {
    const defaultPermissions: Permission[] = [
      // User management
      { id: 'users.read', name: 'Read Users', resource: 'users', action: 'read' },
      { id: 'users.write', name: 'Write Users', resource: 'users', action: 'write' },
      { id: 'users.delete', name: 'Delete Users', resource: 'users', action: 'delete' },
      { id: 'users.support', name: 'Support Users', resource: 'users', action: 'support' },
      { id: 'users.therapy', name: 'Provide Therapy', resource: 'users', action: 'therapy' },

      // Crisis management
      { id: 'crisis.read', name: 'Read Crisis Data', resource: 'crisis', action: 'read' },
      { id: 'crisis.write', name: 'Write Crisis Data', resource: 'crisis', action: 'write' },
      { id: 'crisis.respond', name: 'Respond to Crisis', resource: 'crisis', action: 'respond' },
      { id: 'crisis.chat', name: 'Crisis Chat', resource: 'crisis', action: 'chat' },
      { id: 'crisis.anonymous_chat', name: 'Anonymous Crisis Chat', resource: 'crisis', action: 'anonymous_chat' },
      { id: 'crisis.escalate', name: 'Escalate Crisis', resource: 'crisis', action: 'escalate' },
      { id: 'crisis.seek_help', name: 'Seek Crisis Help', resource: 'crisis', action: 'seek_help' },

      // Volunteer management
      { id: 'volunteers.read', name: 'Read Volunteers', resource: 'volunteers', action: 'read' },
      { id: 'volunteers.write', name: 'Write Volunteers', resource: 'volunteers', action: 'write' },
      { id: 'volunteers.assign', name: 'Assign Volunteers', resource: 'volunteers', action: 'assign' },

      // Tether system
      { id: 'tether.create', name: 'Create Tether', resource: 'tether', action: 'create' },
      { id: 'tether.maintain', name: 'Maintain Tether', resource: 'tether', action: 'maintain' },
      { id: 'tether.request', name: 'Request Tether', resource: 'tether', action: 'request' },
      { id: 'tether.participate', name: 'Participate in Tether', resource: 'tether', action: 'participate' },

      // Emergency
      { id: 'emergency.trigger', name: 'Trigger Emergency', resource: 'emergency', action: 'trigger' },
      { id: 'emergency.assess', name: 'Assess Emergency', resource: 'emergency', action: 'assess' },
      { id: 'emergency.call', name: 'Call Emergency Services', resource: 'emergency', action: 'call' },

      // Profile
      { id: 'profile.read', name: 'Read Profile', resource: 'profile', action: 'read' },
      { id: 'profile.write', name: 'Write Profile', resource: 'profile', action: 'write' },

      // Analytics
      { id: 'analytics.read', name: 'Read Analytics', resource: 'analytics', action: 'read' },

      // Audit
      { id: 'audit.read', name: 'Read Audit Logs', resource: 'audit', action: 'read' }
    ];

    defaultPermissions.forEach(permission => {
      this.permissions.set(permission.id, permission);
    });
  }

  /**
   * Check if user has permission
   */
  public hasPermission(
    userId: string, 
    requiredPermission: string, 
    resource?: any
  ): boolean {
    try {
      const userAuth = this.userAuthorizations.get(userId);
      
      if (!userAuth) {
        this.logger.warn('User authorization not found', { userId, requiredPermission });
        return false;
      }

      // Check for super admin (wildcard permission)
      if (userAuth.permissions.includes('*')) {
        return true;
      }

      // Check direct permission
      if (userAuth.permissions.includes(requiredPermission)) {
        return this.checkPermissionConditions(requiredPermission, resource);
      }

      // Check permissions from roles
      for (const roleId of userAuth.roles) {
        const role = this.roles.get(roleId);
        if (role && (
          role.permissions.includes('*') || 
          role.permissions.includes(requiredPermission)
        )) {
          return this.checkPermissionConditions(requiredPermission, resource);
        }
      }

      this.logger.audit('Permission denied', {
        action: 'permission_check',
        userId,
        requiredPermission,
        userRoles: userAuth.roles,
        userPermissions: userAuth.permissions,
        timestamp: new Date().toISOString()
      });

      return false;
    } catch (error) {
      this.logger.error('Permission check failed', error as Error);
      return false;
    }
  }

  /**
   * Check permission conditions
   */
  private checkPermissionConditions(permissionId: string, resource?: any): boolean {
    const permission = this.permissions.get(permissionId);
    
    if (!permission || !permission.conditions) {
      return true;
    }

    // Implement condition checking logic here
    // For now, return true
    return true;
  }

  /**
   * Set user authorization
   */
  public setUserAuthorization(userAuth: UserAuthorization): void {
    this.userAuthorizations.set(userAuth.userId, userAuth);
    
    this.logger.audit('User authorization set', {
      action: 'auth_set',
      userId: userAuth.userId,
      roles: userAuth.roles,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Add role to user
   */
  public addUserRole(userId: string, roleId: string): void {
    const userAuth = this.userAuthorizations.get(userId);
    
    if (userAuth) {
      if (!userAuth.roles.includes(roleId)) {
        userAuth.roles.push(roleId);
        this.userAuthorizations.set(userId, userAuth);
        
        this.logger.audit('Role added to user', {
          action: 'role_add',
          userId,
          roleId,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  /**
   * Remove role from user
   */
  public removeUserRole(userId: string, roleId: string): void {
    const userAuth = this.userAuthorizations.get(userId);
    
    if (userAuth) {
      userAuth.roles = userAuth.roles.filter(role => role !== roleId);
      this.userAuthorizations.set(userId, userAuth);
      
      this.logger.audit('Role removed from user', {
        action: 'role_remove',
        userId,
        roleId,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Authorization middleware
   */
  public requirePermission(permission: string) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const user = (req as any).user;
      
      if (!user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const hasPermission = this.hasPermission(user.userId, permission, req.body);
      
      if (!hasPermission) {
        this.logger.warn('Authorization failed', {
          action: 'auth_failed',
          userId: user.userId,
          permission,
          path: req.path,
          method: req.method
        });
        
        res.status(403).json({
          error: 'Insufficient permissions',
          required: permission
        });
        return;
      }

      next();
    };
  }

  /**
   * Multiple permissions middleware (requires ALL)
   */
  public requireAllPermissions(permissions: string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const user = (req as any).user;
      
      if (!user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const hasAllPermissions = permissions.every(permission =>
        this.hasPermission(user.userId, permission, req.body)
      );
      
      if (!hasAllPermissions) {
        res.status(403).json({
          error: 'Insufficient permissions',
          required: permissions
        });
        return;
      }

      next();
    };
  }

  /**
   * Any permissions middleware (requires ANY)
   */
  public requireAnyPermission(permissions: string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const user = (req as any).user;
      
      if (!user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const hasAnyPermission = permissions.some(permission =>
        this.hasPermission(user.userId, permission, req.body)
      );
      
      if (!hasAnyPermission) {
        res.status(403).json({
          error: 'Insufficient permissions',
          required: `One of: ${permissions.join(', ')}`
        });
        return;
      }

      next();
    };
  }

  /**
   * Create new role
   */
  public createRole(role: Role): void {
    this.roles.set(role.id, role);
    
    this.logger.audit('Role created', {
      action: 'role_create',
      roleId: role.id,
      roleName: role.name,
      permissions: role.permissions,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Create new permission
   */
  public createPermission(permission: Permission): void {
    this.permissions.set(permission.id, permission);
    
    this.logger.audit('Permission created', {
      action: 'permission_create',
      permissionId: permission.id,
      resource: permission.resource,
      permissionAction: permission.action,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get user permissions (resolved from roles)
   */
  public getUserPermissions(userId: string): string[] {
    const userAuth = this.userAuthorizations.get(userId);
    
    if (!userAuth) {
      return [];
    }

    const allPermissions = new Set(userAuth.permissions);

    // Add permissions from roles
    for (const roleId of userAuth.roles) {
      const role = this.roles.get(roleId);
      if (role) {
        role.permissions.forEach(permission => {
          allPermissions.add(permission);
        });
      }
    }

    return Array.from(allPermissions);
  }

  /**
   * Check if user has role
   */
  public hasRole(userId: string, roleId: string): boolean {
    const userAuth = this.userAuthorizations.get(userId);
    return userAuth ? userAuth.roles.includes(roleId) : false;
  }

  /**
   * Get role by ID
   */
  public getRole(roleId: string): Role | undefined {
    return this.roles.get(roleId);
  }

  /**
   * Get permission by ID
   */
  public getPermission(permissionId: string): Permission | undefined {
    return this.permissions.get(permissionId);
  }
}

export default AuthorizationService;