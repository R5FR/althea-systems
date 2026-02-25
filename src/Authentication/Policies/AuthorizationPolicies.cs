namespace Authentication.Policies;

using Microsoft.AspNetCore.Authorization;

/// <summary>
/// Helper pour configurer les policies d'autorisation basées sur les rôles.
/// </summary>
public static class AuthorizationPolicies
{
    public const string AdminPolicy = "RequireAdminRole";
    public const string UserPolicy = "RequireAuthenticatedUser";

    /// <summary>
    /// Configure les policies d'autorisation.
    /// À appeler dans Program.cs: services.AddAuthorizationPolicies()
    /// </summary>
    public static void AddAuthorizationPolicies(this AuthorizationOptions options)
    {
        // Policy pour les admins
        options.AddPolicy(AdminPolicy, policy =>
            policy.RequireRole("admin"));

        // Policy pour les utilisateurs authentifiés
        options.AddPolicy(UserPolicy, policy =>
            policy.RequireAuthenticatedUser());
    }
}
