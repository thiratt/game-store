use actix_web::{web, HttpResponse, Result, ResponseError};
use crate::models::{LoginRequest, ApiResponse};
use crate::services::AuthService;

pub async fn login(
    auth_service: web::Data<AuthService>,
    login_request: web::Json<LoginRequest>,
) -> Result<HttpResponse> {
    let result = auth_service.login(&login_request).await;

    match result {
        Ok(login_response) => Ok(HttpResponse::Ok().json(login_response)),
        Err(err) => {
            log::error!("Login error: {:?}", err);
            Ok(err.error_response())
        }
    }
}

pub async fn profile(
    auth_service: web::Data<AuthService>,
    user_id: web::Path<String>,
) -> Result<HttpResponse> {
    let result = auth_service.get_user_profile(&user_id).await;

    match result {
        Ok(Some(user)) => {
            Ok(HttpResponse::Ok().json(ApiResponse::success_with_message(
                user,
                "ดึงข้อมูลโปรไฟล์สำเร็จ".to_string(),
            )))
        }
        Ok(None) => {
            Ok(HttpResponse::NotFound().json(ApiResponse::<()>::error(
                "ไม่พบข้อมูลผู้ใช้งาน".to_string(),
            )))
        }
        Err(err) => {
            log::error!("Profile fetch error: {:?}", err);
            Ok(err.error_response())
        }
    }
}