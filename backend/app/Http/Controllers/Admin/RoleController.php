<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class RoleController extends Controller
{
    public function index()
    {
        // Get roles with user count using Spatie's model_has_roles table
        $roles = DB::table('roles')
            ->leftJoin('model_has_roles', function($join) {
                $join->on('model_has_roles.role_id', '=', 'roles.id')
                     ->where('model_has_roles.model_type', '=', 'App\\Models\\User');
            })
            ->select('roles.*', DB::raw('COUNT(DISTINCT model_has_roles.model_id) as users_count'))
            ->groupBy('roles.id', 'roles.name', 'roles.guard_name', 'roles.created_at', 'roles.updated_at')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Roles retrieved successfully',
            'data' => $roles
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:roles,name',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $roleId = DB::table('roles')->insertGetId([
            'name' => $request->name,
            'guard_name' => 'web',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $role = DB::table('roles')->find($roleId);

        return response()->json([
            'success' => true,
            'message' => 'Role created successfully',
            'data' => $role
        ], 201);
    }

    public function show($id)
    {
        $role = DB::table('roles')->find($id);

        if (!$role) {
            return response()->json([
                'success' => false,
                'message' => 'Role not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Role retrieved successfully',
            'data' => $role
        ]);
    }

    public function update(Request $request, $id)
    {
        $role = DB::table('roles')->find($id);

        if (!$role) {
            return response()->json([
                'success' => false,
                'message' => 'Role not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:roles,name,' . $id,
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::table('roles')->where('id', $id)->update([
            'name' => $request->name,
            'updated_at' => now(),
        ]);

        $updatedRole = DB::table('roles')->find($id);

        return response()->json([
            'success' => true,
            'message' => 'Role updated successfully',
            'data' => $updatedRole
        ]);
    }

    public function destroy($id)
    {
        $role = DB::table('roles')->find($id);

        if (!$role) {
            return response()->json([
                'success' => false,
                'message' => 'Role not found'
            ], 404);
        }

        // Prevent deletion of super_admin role
        if ($role->name === 'super_admin') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete super_admin role'
            ], 403);
        }

        DB::table('roles')->where('id', $id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Role deleted successfully'
        ]);
    }

    public function getPermissions($id)
    {
        // Get permissions for the role using Spatie's role_has_permissions table
        $permissions = DB::table('role_has_permissions')
            ->join('permissions', 'role_has_permissions.permission_id', '=', 'permissions.id')
            ->where('role_has_permissions.role_id', $id)
            ->pluck('permissions.name')
            ->toArray();

        return response()->json([
            'success' => true,
            'message' => 'Permissions retrieved successfully',
            'data' => $permissions
        ]);
    }

    public function updatePermissions(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'permissions' => 'required|array',
            'permissions.*' => 'string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        // Delete existing permissions for this role
        DB::table('role_has_permissions')->where('role_id', $id)->delete();

        // Get permission IDs from names
        $permissionIds = DB::table('permissions')
            ->whereIn('name', $request->permissions)
            ->pluck('id')
            ->toArray();

        // Insert new permissions
        $permissions = [];
        foreach ($permissionIds as $permissionId) {
            $permissions[] = [
                'permission_id' => $permissionId,
                'role_id' => $id,
            ];
        }

        if (!empty($permissions)) {
            DB::table('role_has_permissions')->insert($permissions);
        }

        return response()->json([
            'success' => true,
            'message' => 'Permissions updated successfully',
            'data' => $request->permissions
        ]);
    }
}
