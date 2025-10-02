use actix_web::web;
use crate::handlers;

pub fn auth_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/auth")
            .route("/login", web::post().to(handlers::login))
            .route("/profile/{user_id}", web::get().to(handlers::profile)),
    );
}

pub fn user_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/users")
            .route("", web::get().to(handlers::get_users))
            .route("/{user_id}", web::get().to(handlers::get_user_by_id)),
    );
}

pub fn general_routes(cfg: &mut web::ServiceConfig) {
    cfg.route("/", web::get().to(handlers::hello))
        .route("/health", web::get().to(handlers::health_check));
}