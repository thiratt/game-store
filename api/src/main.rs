use std::env;

use actix_web::{get, post, web, App, HttpResponse, HttpServer, Responder};
use actix_cors::Cors;
use dotenvy::dotenv;
use sqlx::mysql::MySqlPoolOptions;

mod schema;
mod model;
use schema::Account;
use model::{UserResponse, LoginRequest, LoginResponse};

async fn hello() -> impl Responder {
    HttpResponse::Ok().body("Hello from Actix + MySQL!")
}

#[get("/users")]
async fn get_users(db_pool: web::Data<sqlx::MySqlPool>) -> impl Responder {
    let users = sqlx::query_as::<_, Account>("
        SELECT  *
        FROM    account
        WHERE   role = 'USER'
    ")
        .fetch_all(db_pool.get_ref())
        .await;

    match users {
        Ok(users) => {
            let user_responses: Vec<UserResponse> = users.into_iter().map(|user| {
                UserResponse {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    wallet_balance: user.wallet_balance.to_string(),
                    created_at: user.created_at,
                }
            }).collect();
            
            HttpResponse::Ok().json(user_responses)
        },
        Err(e) => {
            eprintln!("Database error: {}", e);
            HttpResponse::InternalServerError().body("Error fetching users")
        },
    }
}

#[post("/auth/login")]
async fn login(
    login_request: web::Json<LoginRequest>,
    db_pool: web::Data<sqlx::MySqlPool>
) -> impl Responder {
    let identifier = &login_request.identifier;
    let password = &login_request.password;

    // Try to find user by username or email
    let user = sqlx::query_as::<_, Account>("
        SELECT * FROM account 
        WHERE username = ? OR email = ?
    ")
        .bind(identifier)
        .bind(identifier)
        .fetch_optional(db_pool.get_ref())
        .await;

    match user {
        Ok(Some(account)) => {
            // Verify password
            match bcrypt::verify(password, &account.password_hash) {
                Ok(true) => {
                    let user_response = UserResponse {
                        id: account.id,
                        username: account.username,
                        email: account.email,
                        role: account.role,
                        wallet_balance: account.wallet_balance.to_string(),
                        created_at: account.created_at,
                    };
                    
                    HttpResponse::Ok().json(LoginResponse {
                        success: true,
                        user: Some(user_response),
                        message: Some("เข้าสู่ระบบสำเร็จ".to_string()),
                    })
                },
                Ok(false) => {
                    HttpResponse::Unauthorized().json(LoginResponse {
                        success: false,
                        user: None,
                        message: Some("รหัสผ่านไม่ถูกต้อง".to_string()),
                    })
                },
                Err(_) => {
                    HttpResponse::InternalServerError().json(LoginResponse {
                        success: false,
                        user: None,
                        message: Some("เกิดข้อผิดพลาดในการตรวจสอบรหัสผ่าน".to_string()),
                    })
                }
            }
        },
        Ok(None) => {
            HttpResponse::Unauthorized().json(LoginResponse {
                success: false,
                user: None,
                message: Some("ไม่พบบัญชีผู้ใช้งาน".to_string()),
            })
        },
        Err(e) => {
            eprintln!("Database error: {}", e);
            HttpResponse::InternalServerError().json(LoginResponse {
                success: false,
                user: None,
                message: Some("เกิดข้อผิดพลาดในระบบ".to_string()),
            })
        }
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();

    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL not set");

    let pool = MySqlPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
        .expect("Failed to create MySQL pool");

    HttpServer::new(move || {
        let cors = Cors::default()
            .allowed_origin("http://localhost:4200")
            .allowed_methods(vec!["GET", "POST", "PUT", "DELETE"])
            .allowed_headers(vec!["Content-Type", "Authorization"])
            .max_age(3600);

        App::new()
            .wrap(cors)
            .app_data(web::Data::new(pool.clone()))
            .service(get_users)
            .service(login)
            .route("/", web::get().to(hello))
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}