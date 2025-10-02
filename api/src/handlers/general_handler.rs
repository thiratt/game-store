use actix_web::{HttpResponse, Result};
use crate::models::ApiResponse;

pub async fn health_check() -> Result<HttpResponse> {
    Ok(HttpResponse::Ok().json(ApiResponse::success_with_message(
        "API is running",
        "เซิร์ฟเวอร์ทำงานปกติ".to_string(),
    )))
}

pub async fn hello() -> Result<HttpResponse> {
    Ok(HttpResponse::Ok().json(ApiResponse::success_with_message(
        "Hello from Kiro Game Store API!",
        "ยินดีต้อนรับสู่ Kiro Game Store API".to_string(),
    )))
}