use serde::{Deserialize, Serialize};
use sqlx::{FromRow, types::chrono::{DateTime, Utc}};

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Account {
    pub id: String,
    pub username: String,
    pub email: String,
    pub password_hash: String,
    pub profile_image: Option<String>,
    pub role: String,
    pub wallet_balance: bigdecimal::BigDecimal,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl Account {
    pub fn to_user_response(&self) -> super::dto::UserResponse {
        super::dto::UserResponse {
            id: self.id.clone(),
            username: self.username.clone(),
            email: self.email.clone(),
            role: self.role.clone(),
            wallet_balance: self.wallet_balance.to_string(),
            created_at: self.created_at,
        }
    }
}