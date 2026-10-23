//! Core of the shop: domain model and storage.

pub mod model;
pub mod store;
mod error;
#[path = "util_impl.rs"]
mod util;

pub use crate::error::{Error, Result};
pub use store::Store as Storage;

/// Version of the core crate.
pub const VERSION: &str = "0.1.0";

/// Parses a price in cents.
pub fn parse_price(text: &str) -> Result<u64> {
    util::digits(text).ok_or(Error::Invalid { input: text.to_string() })
}

pub(crate) fn internal() {}

/// Small helpers that are part of the API.
pub mod prelude {
    pub fn version() -> &'static str {
        crate::VERSION
    }
}

#[macro_export]
macro_rules! price {
    ($e:expr) => {
        $crate::parse_price($e)
    };
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn parses() {
        assert!(parse_price("12").is_ok());
    }
}
