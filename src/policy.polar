actor User { }

# A group is a kind of actor
actor Group { }

global {
  roles = ["superadmin"];
}

resource Organization { 
    roles = ["admin", "member"];
    permissions = ["read", "add_member"];

    # role hierarchy:
    # admins inherit all member permissions
    "member" if "admin";

    "admin" if global "superadmin";

    # org-level permissions
    "read" if "member";
    "add_member" if "admin";
}

resource Repository { 
    permissions = [
        "read", "write", "delete"
    ];
    roles = ["reader", "admin", "maintainer", "editor"];
    relations = { organization: Organization };

    "reader" if "member" on "organization";
    "admin" if "admin" on "organization";
    "reader" if "editor";
    "editor" if "maintainer";
    "maintainer" if "admin";

    # reader permissions
    "read" if "reader";

    # editor permissions
    "write" if "editor";
}

has_permission(_: Actor, "read", repo: Repository) if
    is_public(repo, true);


has_permission(actor: Actor, "delete", repo: Repository) if
    has_role(actor, "admin", repo) and
    is_protected(repo, false);

has_role(actor: Actor, role: String, repo: Repository) if
  org matches Organization and
  has_relation(repo, "organization", org) and
  has_default_role(org, role) and
  has_role(actor, "member", org);

has_role(user: User, role: String, resource: Resource) if
  group matches Group and
  has_group(user, group) and
  has_role(group, role, resource);