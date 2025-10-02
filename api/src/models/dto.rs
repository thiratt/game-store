use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct UserResponse {
    pub id: String,
    pub username: String,
    pub email: String,
    pub role: String,
    pub wallet_balance: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct LoginResponse {
    pub success: bool,
    pub user: Option<UserResponse>,
    pub message: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub message: Option<String>,
}

impl<T> ApiResponse<T> {
    pub fn success(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            message: None,
        }
    }

    pub fn success_with_message(data: T, message: String) -> Self {
        Self {
            success: true,
            data: Some(data),
            message: Some(message),
        }
    }

    pub fn error(message: String) -> Self {
        Self {
            success: false,
            data: None,
            message: Some(message),
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub identifier: String,
    pub password: String,
}

impl LoginRequest {
    pub fn validate(&self) -> Result<(), String> {
        if self.identifier.trim().is_empty() {
            return Err("กรุณากรอกชื่อผู้ใช้งานหรืออีเมล".to_string());
        }
        if self.password.trim().is_empty() {
            return Err("กรุณากรอกรหัสผ่าน".to_string());
        }
        if self.password.len() < 6 {
            return Err("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร".to_string());
        }
        Ok(())
    }
}