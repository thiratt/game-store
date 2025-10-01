use std::env;

use actix_web::{get, web, App, HttpResponse, HttpServer, Responder};
use dotenvy::dotenv;
use sqlx::mysql::MySqlPoolOptions;

mod schema;
mod model;
use schema::Account;
use model::UserResponse;

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
        App::new()
            .app_data(web::Data::new(pool.clone()))
            .service(get_users)
            .route("/", web::get().to(hello))
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}