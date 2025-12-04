


import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react';
import { api } from '../utils/api';

function ViewRole() {
  const { id } = useParams();
  const [role, setRole] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ text: '', type: '' });

  // Group permissions by category
  const groupedPermissions = useMemo(() => {
    return permissions.reduce((groups, permission) => {
      const category = permission.category || 'Uncategorized';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(permission);
      return groups;
    }, {});
  }, [permissions]);

  // Check if all permissions are selected
  const allPermissionsSelected = useMemo(() => {
    const allPerms = Object.values(groupedPermissions).flat().map(p => p.name);
    return allPerms.length > 0 && allPerms.every(p => selectedPermissions.includes(p));
  }, [selectedPermissions, groupedPermissions]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [permissionsResponse, roleResponse] = await Promise.all([
        api.get('permissions'),
        api.get(`roles/permissions/${id}`)
      ]);
      
      setPermissions(permissionsResponse.data || []);
      
      if (roleResponse.data) {
        setRole(roleResponse.data);
        const rolePerms = roleResponse.data.permissions?.map(p => p.name || p) || [];
        setSelectedPermissions(rolePerms);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setSaveMessage({ 
        text: 'Failed to load data. Please refresh the page.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const capitalizeFirst = useCallback((str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }, []);

  // Permission selection helpers
  const isPermissionSelected = useCallback((permissionName) => {
    return selectedPermissions.includes(permissionName);
  }, [selectedPermissions]);

  const togglePermission = useCallback((permissionName) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionName) 
        ? prev.filter(p => p !== permissionName) 
        : [...prev, permissionName]
    );
  }, []);

  // Select/Deselect all permissions
  const toggleAllPermissions = useCallback(() => {
    const allPerms = Object.values(groupedPermissions).flat().map(p => p.name);
    setSelectedPermissions(prev => 
      prev.length === allPerms.length ? [] : allPerms
    );
  }, [groupedPermissions]);

  // Save permissions to server
  const savePermissions = useCallback(async () => {
    setSaving(true);
    setSaveMessage({ text: '', type: '' });
    
    
    try {
      await api.post(`role/${id}/permissions`, {
        permissions: selectedPermissions
      });

      

      
      setSaveMessage({ 
        text: 'Permissions updated successfully!', 
        type: 'success' 
      });
      
      // Refresh role data
      await fetchData();
    } catch (error) {
      console.error("Error saving permissions:", error);
      setSaveMessage({ 
        text: error.response?.data?.message || 'Failed to update permissions. Please try again.', 
        type: 'error' 
      });
    } finally {
      setSaving(false);
    }
  }, [id, selectedPermissions, fetchData]);

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  // Error state (if no role found)
  if (!role) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-800">
          Role not found
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          The requested role could not be loaded.
        </p>
      </div>
    );
  }

  // ... rest of the component remains the same ...
  return (
    <div className='bg-white border border-gray-200 overflow-hidden transition-colors duration-200'>
      {/* Header */}
      <div className='px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-gray-200'>
        <div>
          <h2 className='text-xl font-semibold text-gray-800 flex gap-3 items-center'>
            <ShieldCheck size={23} />
            <span>{capitalizeFirst(role.role)} Permissions</span>
          </h2>
          <p className='text-sm text-gray-500 mt-1'>
            Manage access controls for this role
          </p>
        </div>

        <div className='flex-shrink-0 flex gap-2'>
          <button
            className='py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-xs hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:pointer-events-none transition-colors'
            onClick={savePermissions}
            disabled={saving || loading}
            aria-label='Save permissions'
          >
            {saving ? (
              <>
                <svg
                  className='animate-spin h-4 w-4 text-gray-500'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                >
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                  ></circle>
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  ></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg
                  className='shrink-0 size-4'
                  xmlns='http://www.w3.org/2000/svg'
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z'></path>
                  <polyline points='17 21 17 13 7 13 7 21'></polyline>
                  <polyline points='7 3 7 8 15 8'></polyline>
                </svg>
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      <div className='p-6 space-y-6'>
        {/* Status message */}
        {saveMessage.text && (
          <div
            className={`p-4 rounded-lg border ${
              saveMessage.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <div className='flex items-center gap-2'>
              {saveMessage.type === 'success' ? (
                <svg
                  className='w-5 h-5'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                    clipRule='evenodd'
                  />
                </svg>
              ) : (
                <svg
                  className='w-5 h-5'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                    clipRule='evenodd'
                  />
                </svg>
              )}
              <span>{saveMessage.text}</span>
            </div>
          </div>
        )}

        {/* Role information */}
        <div className='p-4 bg-gray-50 rounded-lg border border-gray-200'>
          <div className='flex flex-wrap items-center gap-3'>
            <span className='px-3 py-1.5 rounded-lg border border-gray-300 bg-white shadow-xs text-sm font-medium text-gray-700'>
              {capitalizeFirst(role.role)}
            </span>
            <div className='text-sm text-gray-500'>
              <span className='font-medium text-gray-700'>
                {selectedPermissions.length}
              </span>{' '}
              of{' '}
              <span className='font-medium text-gray-700'>
                {Object.values(groupedPermissions).flat().length}
              </span>{' '}
              permissions selected
            </div>
          </div>
        </div>

        {/* Permissions section */}
        <div className='space-y-8'>
          <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3'>
            <div>
              <h3 className='text-lg font-medium text-gray-800'>
                Permissions
              </h3>
              <p className='text-sm text-gray-500 mt-1'>
                Toggle permissions to control access for this role
              </p>
            </div>
            {Object.keys(groupedPermissions).length > 0 && (
              <button
                onClick={toggleAllPermissions}
                className='text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors'
                disabled={loading}
              >
                {allPermissionsSelected ? 'Deselect all' : 'Select all'}
              </button>
            )}
          </div>

          {Object.keys(groupedPermissions).length === 0 ? (
            <div className='text-center py-8'>
              <svg
                className='mx-auto h-12 w-12 text-gray-400'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={1.5}
                  d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
                />
              </svg>
              <h4 className='mt-2 text-sm font-medium text-gray-800'>
                No permissions available
              </h4>
              <p className='mt-1 text-sm text-gray-500'>
                Contact your administrator to add permissions
              </p>
            </div>
          ) : (
            Object.entries(groupedPermissions).map(([category, perms]) => (
              <section key={category} className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <h4 className='text-md font-medium text-gray-700'>
                    {category}
                  </h4>
                  <span className='text-xs text-gray-500'>
                    {perms.filter((p) => isPermissionSelected(p.name)).length}/
                    {perms.length} selected
                  </span>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                  {perms.map((permission) => (
                    <div
                      key={permission.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        isPermissionSelected(permission.name)
                          ? 'border-blue-200 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => togglePermission(permission.name)}
                      onKeyDown={(e) =>
                        e.key === 'Enter' && togglePermission(permission.name)
                      }
                      tabIndex={0}
                      role='checkbox'
                      aria-checked={isPermissionSelected(permission.name)}
                    >
                      <div className='flex items-start gap-3'>
                        <div className='mt-0.5'>
                          <input
                            type='checkbox'
                            id={`permission-${permission.id}`}
                            className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer'
                            checked={isPermissionSelected(permission.name)}
                            onChange={() => togglePermission(permission.name)}
                            aria-labelledby={`permission-label-${permission.id}`}
                          />
                        </div>
                        <div>
                          <label
                            id={`permission-label-${permission.id}`}
                            htmlFor={`permission-${permission.id}`}
                            className='block text-sm font-medium text-gray-700 cursor-pointer'
                          >
                            {permission.name}
                          </label>
                          {permission.description && (
                            <p className='mt-1 text-xs text-gray-500'>
                              {permission.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default ViewRole;