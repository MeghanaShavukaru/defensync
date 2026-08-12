import api from '../api';

export const fetchBases = () => api.get('/bases');
export const fetchEquipmentTypes = () => api.get('/equipment-types');
export const fetchSuppliers = () => api.get('/suppliers');
export const fetchUsers = () => api.get('/admin/users');
