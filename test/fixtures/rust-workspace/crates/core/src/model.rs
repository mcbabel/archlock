//! Domain types.

mod user;

pub use self::user::*;

use serde::{Deserialize, Serialize};

/// A product id.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct ProductId(pub u64);

/// Something that has a price.
pub trait Priced {
    /// Currency of the price.
    type Currency: Clone;
    /// Smallest price.
    const MIN: u64;
    fn price(&self) -> u64;
    fn label(&self) -> String {
        format!("{} cents", self.price())
    }
}
