//! Storage.

pub mod memory;

use crate::model::{ProductId, User};
use crate::Result;

/// A key-value store of users.
pub trait Store: Send + Sync {
    fn get(&self, id: u64) -> Result<Option<User<'static>>>;
    fn put(&mut self, user: User<'static>) -> Result<()>;
    fn ids(&self) -> Box<dyn Iterator<Item = ProductId> + '_>;
}
