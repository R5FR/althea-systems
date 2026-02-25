namespace DAL.Extensions;

using Application.Interfaces;
using DAL.Context;
using DAL.UnitOfWork;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

public static class DependencyInjectionExtensions
{
    public static IServiceCollection AddDataAccessLayer(
        this IServiceCollection services,
        string connectionString)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(connectionString));

        services.AddScoped<IUnitOfWork, UnitOfWork.UnitOfWork>();

        return services;
    }
}
