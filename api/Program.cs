using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using api.Models.Tables;
using api.Services;
using DotEnv.Core;

namespace api
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            new EnvLoader().Load();
            ConfigureServices(builder.Services);

            var app = builder.Build();

            await RunStartupValidationsAsync(app);

            ConfigureMiddleware(app);

            app.Run();
        }

        private static async Task RunStartupValidationsAsync(WebApplication app)
        {
            using var scope = app.Services.CreateScope();
            var validationService = scope.ServiceProvider.GetRequiredService<StartupValidationService>();

            try
            {
                await validationService.ValidateStartupRequirementsAsync();
            }
            catch (Exception ex)
            {
                var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
                logger.LogCritical(ex, "Application failed to start due to validation errors");

                Console.WriteLine("🚨 APPLICATION STARTUP FAILED 🚨");
                Console.WriteLine($"Error: {ex.Message}");
                Console.WriteLine("\nPlease fix the above issues and restart the application.");

                Environment.Exit(1);
            }
        }

        private static void ConfigureServices(IServiceCollection services)
        {
            services.AddControllers();
            services.AddEndpointsApiExplorer();
            services.AddOpenApi();

            services.AddDbContext<KiroContext>(options =>
            {
                string? connectionString = Environment.GetEnvironmentVariable("CONNECTION_STRING");
                if (string.IsNullOrEmpty(connectionString))
                {
                    throw new InvalidOperationException("CONNECTION_STRING environment variable is not set.");
                }

                options.UseMySql(
                    connectionString,
                    ServerVersion.AutoDetect(connectionString)
                );
            });

            services.AddCors(options =>
            {
                options.AddPolicy("AllowAngularClient", policy =>
                {
                    policy.WithOrigins("http://localhost:4200")
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials();
                });
                options.AddPolicy("AllowProductionAngularClient", policy =>
                {
                    policy.WithOrigins("https://kiro.weallarethe.best")
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials();
                });
            });

            services.AddProblemDetails();
            services.AddHttpClient();

            services.AddScoped<StartupValidationService>();

            services.AddControllers()
            .AddJsonOptions(
                o =>
                {
                    o.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingDefault | JsonIgnoreCondition.WhenWritingNull;
                    // o.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.Preserve;
                    o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.SnakeCaseLower));
                    o.JsonSerializerOptions.NumberHandling = JsonNumberHandling.AllowNamedFloatingPointLiterals;
                }
            );
        }

        private static void ConfigureMiddleware(WebApplication app)
        {
            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
                app.UseDeveloperExceptionPage();
                app.UseCors("AllowAngularClient");
            }
            else
            {
                app.UseExceptionHandler("/error");
                app.UseHsts();
                app.UseHttpsRedirection();
                app.UseCors("AllowProductionAngularClient");
            }

            app.UseStatusCodePages();
            app.UseAuthentication();
            app.UseAuthorization();
            app.UseWebSockets();
            app.MapControllers();
        }
    }
}