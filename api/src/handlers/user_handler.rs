use actix_web::{web, HttpResponse, Result, ResponseError};
use crate::models::ApiResponse;
use crate::services::UserRepository;

pub async fn get_users(
    user_repository: web::Data<UserRepository>,
) -> Result<HttpResponse> {
    let result = user_repository.find_all_users().await;

    match result {
        Ok(users) => {
            Ok(HttpResponse::Ok().json(ApiResponse::success_with_message(
                users,
                "ดึงข้อมูลผู้ใช้งานสำเร็จ".to_string(),
            )))
        }
        Err(err) => {
            log::error!("Get users error: {:?}", err);
            Ok(err.error_response())
        }
    }
}

pub async fn get_user_by_id(
    user_repository: web::Data<UserRepository>,
    user_id: web::Path<String>,
) -> Result<HttpResponse> {
    let result = user_repository.find_by_id(&user_id).await;

    match result {
        Ok(Some(user)) => {
            Ok(HttpResponse::Ok().json(ApiResponse::success_with_message(
                user.to_user_response(),
                "ดึงข้อมูลผู้ใช้งานสำเร็จ".to_string(),
            )))
        }
        Ok(None) => {
            Ok(HttpResponse::NotFound().json(ApiResponse::<()>::error(
                "ไม่พบข้อมูลผู้ใช้งาน".to_string(),
            )))
        }
        Err(err) => {
            log::error!("Get user by ID error: {:?}", err);
            Ok(err.error_response())
        }
    }
}