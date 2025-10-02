use std::env;
use actix_cors::Cors;
use actix_web::web;
use sqlx::{mysql::MySqlPoolOptions, MySqlPool};
use crate::services::{UserRepository, AuthService};

pub struct AppConfig {
    pub database_url: String,
    pub cors_origin: String,
    pub server_host: String,
    pub server_port: u16,
}

impl AppConfig {
    pub fn from_env() -> Self {
        Self {
            database_url: env::var("DATABASE_URL").expect("DATABASE_URL not set"),
            cors_origin: env::var("CORS_ORIGIN").unwrap_or_else(|_| "http://localhost:4200".to_string()),
            server_host: env::var("SERVER_HOST").unwrap_or_else(|_| "127.0.0.1".to_string()),
            server_port: env::var("SERVER_PORT")
                .unwrap_or_else(|_| "8080".to_string())
                .parse()
                .expect("Invalid SERVER_PORT"),
        }
    }
}

pub async fn create_db_pool(database_url: &str) -> Result<MySqlPool, sqlx::Error> {
    MySqlPoolOptions::new()
        .max_connections(10)
        .connect(database_url)
        .await
}

pub fn create_cors(cors_origin: &str) -> Cors {
    Cors::default()
        .allowed_origin(cors_origin)
        .allowed_methods(vec!["GET", "POST", "PUT", "DELETE", "PATCH"])
        .allowed_headers(vec!["Content-Type", "Authorization"])
        .max_age(3600)
}

pub fn configure_services(cfg: &mut web::ServiceConfig, pool: MySqlPool) {
    let user_repository = UserRepository::new(pool.clone());
    let auth_service = AuthService::new(user_repository);
    
    cfg.app_data(web::Data::new(UserRepository::new(pool)))
        .app_data(web::Data::new(auth_service));
}