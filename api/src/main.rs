use actix_web::HttpServer;
use dotenvy::dotenv;
use env_logger::Env;

mod config;
mod handlers;
mod models;
mod routes;
mod services;
mod utils;

use config::{AppConfig, create_cors, create_db_pool};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Initialize environment variables and logging
    dotenv().ok();
    env_logger::init_from_env(Env::default().default_filter_or("info"));

    // Load configuration
    let app_config = AppConfig::from_env();
    log::info!("Starting Kiro Game Store API server...");
    log::info!("Server will run on {}:{}", app_config.server_host, app_config.server_port);

    // Create database connection pool
    let pool = create_db_pool(&app_config.database_url)
        .await
        .expect("Failed to create MySQL connection pool");
    
    log::info!("Database connection pool created successfully");

    // Start HTTP server  
    let cors_origin = app_config.cors_origin.clone();
    HttpServer::new(move || {
        use actix_web::{App, middleware::Logger};
        let cors = create_cors(&cors_origin);
        
        App::new()
            .wrap(cors)
            .wrap(Logger::default())
            .configure(|cfg| config::configure_services(cfg, pool.clone()))
            .configure(routes::general_routes)
            .configure(routes::auth_routes)
            .configure(routes::user_routes)
    })
    .bind((app_config.server_host.as_str(), app_config.server_port))?
    .run()
    .await
}