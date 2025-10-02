use crate::models::{LoginRequest, LoginResponse, UserResponse};
use crate::services::UserRepository;
use crate::utils::{AppError, AppResult};

pub struct AuthService {
    user_repository: UserRepository,
}

impl AuthService {
    pub fn new(user_repository: UserRepository) -> Self {
        Self { user_repository }
    }

    pub async fn login(&self, login_request: &LoginRequest) -> AppResult<LoginResponse> {
        if let Err(validation_error) = login_request.validate() {
            return Ok(LoginResponse {
                success: false,
                user: None,
                message: Some(validation_error),
            });
        }

        let user = self
            .user_repository
            .find_by_identifier(&login_request.identifier)
            .await?;

        match user {
            Some(account) => {
                let is_valid = bcrypt::verify(&login_request.password, &account.password_hash)
                    .map_err(|_| AppError::HashError)?;

                if is_valid {
                    Ok(LoginResponse {
                        success: true,
                        user: Some(account.to_user_response()),
                        message: Some("เข้าสู่ระบบสำเร็จ".to_string()),
                    })
                } else {
                    Ok(LoginResponse {
                        success: false,
                        user: None,
                        message: Some("รหัสผ่านไม่ถูกต้อง".to_string()),
                    })
                }
            }
            None => Ok(LoginResponse {
                success: false,
                user: None,
                message: Some("ไม่พบบัญชีผู้ใช้งาน".to_string()),
            }),
        }
    }

    pub async fn get_user_profile(&self, user_id: &str) -> AppResult<Option<UserResponse>> {
        let user = self.user_repository.find_by_id(user_id).await?;
        Ok(user.map(|account| account.to_user_response()))
    }
}