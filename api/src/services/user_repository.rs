use sqlx::MySqlPool;
use crate::models::{Account, UserResponse};
use crate::utils::AppResult;

pub struct UserRepository {
    pool: MySqlPool,
}

impl UserRepository {
    pub fn new(pool: MySqlPool) -> Self {
        Self { pool }
    }

    pub async fn find_all_users(&self) -> AppResult<Vec<UserResponse>> {
        let users = sqlx::query_as::<_, Account>(
            "SELECT * FROM account WHERE role = 'USER' ORDER BY created_at DESC"
        )
        .fetch_all(&self.pool)
        .await?;

        let user_responses: Vec<UserResponse> = users
            .into_iter()
            .map(|user| user.to_user_response())
            .collect();

        Ok(user_responses)
    }

    pub async fn find_by_identifier(&self, identifier: &str) -> AppResult<Option<Account>> {
        let user = sqlx::query_as::<_, Account>(
            "SELECT * FROM account WHERE username = ? OR email = ?"
        )
        .bind(identifier)
        .bind(identifier)
        .fetch_optional(&self.pool)
        .await?;

        Ok(user)
    }

    pub async fn find_by_id(&self, user_id: &str) -> AppResult<Option<Account>> {
        let user = sqlx::query_as::<_, Account>(
            "SELECT * FROM account WHERE id = ?"
        )
        .bind(user_id)
        .fetch_optional(&self.pool)
        .await?;

        Ok(user)
    }

    // pub async fn find_by_username(&self, username: &str) -> AppResult<Option<Account>> {
    //     let user = sqlx::query_as::<_, Account>(
    //         "SELECT * FROM account WHERE username = ?"
    //     )
    //     .bind(username)
    //     .fetch_optional(&self.pool)
    //     .await?;

    //     Ok(user)
    // }

    // pub async fn find_by_email(&self, email: &str) -> AppResult<Option<Account>> {
    //     let user = sqlx::query_as::<_, Account>(
    //         "SELECT * FROM account WHERE email = ?"
    //     )
    //     .bind(email)
    //     .fetch_optional(&self.pool)
    //     .await?;

    //     Ok(user)
    // }
}