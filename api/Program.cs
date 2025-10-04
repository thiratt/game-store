using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.RateLimiting;
using System.Text.Json;
using api.Models.Tables;
using DotEnv.Core;

namespace api
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            new EnvLoader().Load();
            ConfigureServices(builder.Services);

            var app = builder.Build();

            ConfigureMiddleware(app);

            app.Run();
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

            services.AddRateLimiter(options =>
            {
                options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
                options.AddFixedWindowLimiter("LoginPolicy", opt =>
                {
                    opt.PermitLimit = 5;
                    opt.Window = TimeSpan.FromMinutes(1);
                    // opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
                    opt.QueueLimit = 0;
                });
                options.AddFixedWindowLimiter("ApiGlobalPolicy", opt =>
                {
                    opt.PermitLimit = 100;
                    opt.Window = TimeSpan.FromMinutes(1);
                    opt.QueueLimit = 0;
                });
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
            app.UseRateLimiter();
            app.UseAuthentication();
            app.UseAuthorization();
            app.UseWebSockets();
            app.MapControllers();
        }
    }
}