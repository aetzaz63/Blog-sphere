// Admin authentication middleware helper
// Use this in admin pages to check if user is authenticated as admin

export const checkAdminAuth = (user, router) => {
  if (!user || !user.isAdmin) {
    router.push('/admin/login');
    return false;
  }
  return true;
};

export const isAdmin = (user) => {
  return user && user.isAdmin === true;
};