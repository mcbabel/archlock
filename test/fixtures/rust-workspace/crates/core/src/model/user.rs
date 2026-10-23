use serde::Serialize;

/// A customer account.
#[derive(Debug, Clone, Serialize)]
pub struct User<'a> {
    pub id: u64,
    pub name: &'a str,
    pub(crate) email: String,
    password: String,
}

/// Roles of a user.
#[derive(Debug, Clone, Copy)]
pub enum Role {
    Guest = 0,
    Member = 1,
    Admin = 2,
}
