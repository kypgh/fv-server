export const PERMISSIONS = Object.freeze({
  USERS: {
    get_user: "users.get_user",
    view_users: "users.view_users",
    update_users: "users.update_users",
  },
  POSTS: {
    get_post: "posts.get_post",
    view_posts: "posts.view_posts",
    update_posts: "posts.update_posts",
    view_reported_posts: "posts.view_reported_posts",
  },
  ROLES: {
    update_crm_user_role: "roles.update_crm_user_role",
    update_role_permissions: "roles.update_roles_permissions",
    delete_role: "roles.delete_role",
    view_roles: "roles.view_roles",
    create_role: "roles.create_role",
    get_role: "roles.get_role",
  },
  CRMUSERS: {
    create_crmuser: "crmusers.create_crmuser",
    view_crmusers: "crmusers.view_crmusers",
    update_crmusers: "crmusers.update_crmusers",
    delete_crmuser: "crmusers.delete_crmuser",
    get_crmuser: "crmusers.get_crmuser",
    update_crmuser: "crmusers.update_crmuser",
  },
  BRANCHINGTAGS: {
    view_branchingtags: "branchingtags.view_branchingtags",
    update_branchingtags: "branchingtags.update_branchingtags",
  },
  RIGHTS: {
    view_rights: "rights.view_rights",
    update_crm_user_rights: "rights.update_crm_user_rights",
  },
  COMMENTS: {
    view_comments: "comments.view_comments",
    update_comments: "comments.update_comments",
  },
  POSTSREPORTS: {
    update_post_report: "postsreports.update_post_report",
    view_posts_reports: "postsreports.view_posts_reports",
    delete_posts_report: "postsreports.delete_posts_report",
  },
  SYMBOLTAGS: {
    delete_symboltag: "symboltags.delete_symboltag",
    view_symboltags: "symboltags.view_symboltags",
    update_symboltag: "symboltags.update_symboltag",
    create_symboltag: "symboltags.create_symboltag",
  },
});
