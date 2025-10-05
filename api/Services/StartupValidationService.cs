using Microsoft.EntityFrameworkCore;
using api.Models.Tables;

namespace api.Services
{
    public class StartupValidationService(IServiceProvider serviceProvider, ILogger<StartupValidationService> logger)
    {
        private readonly IServiceProvider _serviceProvider = serviceProvider;
        private readonly ILogger<StartupValidationService> _logger = logger;

        public async Task ValidateStartupRequirementsAsync()
        {
            _logger.LogInformation("Starting application startup validation...");

            try
            {
                ValidateEnvironmentVariables();

                await ValidateDatabaseConnectionAsync();

                await ValidateRequiredTablesAsync();

                ValidateUploadsDirectory();

                _logger.LogInformation("✅ All startup validations passed successfully!");
            }
            catch (Exception ex)
            {
                _logger.LogCritical(ex, "❌ Startup validation failed: {Message}", ex.Message);
                throw new InvalidOperationException($"Application startup validation failed: {ex.Message}", ex);
            }
        }

        private void ValidateEnvironmentVariables()
        {
            _logger.LogInformation("Validating required environment variables...");

            var requiredEnvVars = new Dictionary<string, string?>
            {
                ["CONNECTION_STRING"] = Environment.GetEnvironmentVariable("CONNECTION_STRING"),
                // ["JWT_SECRET"] = Environment.GetEnvironmentVariable("JWT_SECRET"),
                // ["API_KEY"] = Environment.GetEnvironmentVariable("API_KEY"),
            };

            var missingVars = new List<string>();

            foreach (var envVar in requiredEnvVars)
            {
                if (string.IsNullOrEmpty(envVar.Value))
                {
                    missingVars.Add(envVar.Key);
                    _logger.LogError("Missing required environment variable: {VarName}", envVar.Key);
                }
                else
                {
                    _logger.LogDebug("✅ Environment variable {VarName} is set", envVar.Key);
                }
            }

            if (missingVars.Count != 0)
            {
                throw new InvalidOperationException(
                    $"Missing required environment variables: {string.Join(", ", missingVars)}. " +
                    "Please ensure all required environment variables are set before starting the application.");
            }

            _logger.LogInformation("✅ All required environment variables are present");
        }

        private async Task ValidateDatabaseConnectionAsync()
        {
            _logger.LogInformation("Validating database connection...");

            using var scope = _serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<KiroContext>();

            try
            {
                var canConnect = await dbContext.Database.CanConnectAsync();
                if (!canConnect)
                {
                    throw new InvalidOperationException("Cannot establish connection to the database");
                }

                _logger.LogInformation("✅ Database connection successful");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Database connection failed");
                throw new InvalidOperationException(
                    $"Database connection failed: {ex.Message}. " +
                    "Please verify your CONNECTION_STRING and ensure the database server is running.", ex);
            }
        }

        private async Task ValidateRequiredTablesAsync()
        {
            _logger.LogInformation("Validating required database tables...");

            using var scope = _serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<KiroContext>();

            var requiredTables = new[]
            {
                "account",
                "admin_activity_log",
                "cart_item",
                "discount_code",
                "discount_usage",
                "game",
                "game_category",
                "purchase",
                "purchase_item",
                "transaction_history",
                "user_game"
            };

            var missingTables = new List<string>();

            try
            {
                foreach (var tableName in requiredTables)
                {
                    var tableExists = await CheckTableExistsAsync(dbContext, tableName);
                    if (!tableExists)
                    {
                        missingTables.Add(tableName);
                        _logger.LogError("Missing required table: {TableName}", tableName);
                    }
                    else
                    {
                        _logger.LogDebug("✅ Table {TableName} exists", tableName);
                    }
                }

                if (missingTables.Count != 0)
                {
                    throw new InvalidOperationException(
                        $"Missing required database tables: {string.Join(", ", missingTables)}. " +
                        "Please run database migrations or ensure the database schema is properly set up.");
                }

                _logger.LogInformation("✅ All required database tables are present");
            }
            catch (Exception ex) when (ex is not InvalidOperationException)
            {
                _logger.LogError(ex, "Error validating database tables");
                throw new InvalidOperationException(
                    $"Failed to validate database tables: {ex.Message}", ex);
            }
        }

        private static async Task<bool> CheckTableExistsAsync(KiroContext dbContext, string tableName)
        {
            try
            {
                var count = tableName switch
                {
                    "account" => await dbContext.Accounts.CountAsync(),
                    "admin_activity_log" => await dbContext.AdminActivityLogs.CountAsync(),
                    "cart_item" => await dbContext.CartItems.CountAsync(),
                    "discount_code" => await dbContext.DiscountCodes.CountAsync(),
                    "discount_usage" => await dbContext.DiscountUsages.CountAsync(),
                    "game" => await dbContext.Games.CountAsync(),
                    "game_category" => await dbContext.GameCategories.CountAsync(),
                    "purchase" => await dbContext.Purchases.CountAsync(),
                    "purchase_item" => await dbContext.PurchaseItems.CountAsync(),
                    "transaction_history" => await dbContext.TransactionHistories.CountAsync(),
                    "user_game" => await dbContext.UserGames.CountAsync(),
                    _ => -1
                };

                return count >= 0;
            }
            catch
            {
                return false;
            }
        }

        private void ValidateUploadsDirectory()
        {
            _logger.LogInformation("Validating uploads directory...");

            var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads");

            try
            {
                if (!Directory.Exists(uploadsPath))
                {
                    Directory.CreateDirectory(uploadsPath);
                    _logger.LogInformation("Created uploads directory at: {Path}", uploadsPath);
                }

                var testFile = Path.Combine(uploadsPath, $"test_{Guid.NewGuid()}.tmp");
                File.WriteAllText(testFile, "test");
                File.Delete(testFile);

                _logger.LogInformation("✅ Uploads directory is accessible and writable");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to validate uploads directory");
                throw new InvalidOperationException(
                    $"Uploads directory validation failed: {ex.Message}. " +
                    "Please ensure the application has write permissions to the uploads directory.", ex);
            }
        }
    }
}