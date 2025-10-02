use actix_web::{HttpResponse, ResponseError};
use serde_json::json;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("Database error: {0}")]
    DatabaseError(#[from] sqlx::Error),
    
    #[error("Authentication failed: {0}")]
    AuthenticationError(String),
    
    #[error("Validation error: {0}")]
    ValidationError(String),
    
    #[error("Not found: {0}")]
    NotFound(String),
    
    #[error("Internal server error: {0}")]
    InternalError(String),
    
    #[error("Password hashing error")]
    HashError,
}

impl ResponseError for AppError {
    fn error_response(&self) -> HttpResponse {
        log::error!("Application error: {}", self);
        
        match self {
            AppError::AuthenticationError(msg) => HttpResponse::Unauthorized().json(json!({
                "success": false,
                "message": msg,
                "error_type": "authentication_error"
            })),
            AppError::ValidationError(msg) => HttpResponse::BadRequest().json(json!({
                "success": false,
                "message": msg,
                "error_type": "validation_error"
            })),
            AppError::NotFound(msg) => HttpResponse::NotFound().json(json!({
                "success": false,
                "message": msg,
                "error_type": "not_found"
            })),
            AppError::DatabaseError(_) => HttpResponse::InternalServerError().json(json!({
                "success": false,
                "message": "เกิดข้อผิดพลาดในระบบฐานข้อมูล",
                "error_type": "database_error"
            })),
            _ => HttpResponse::InternalServerError().json(json!({
                "success": false,
                "message": "เกิดข้อผิดพลาดในระบบ",
                "error_type": "internal_error"
            }))
        }
    }
}

pub type AppResult<T> = Result<T, AppError>;