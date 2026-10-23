use std::fmt;

/// Everything that can go wrong.
#[derive(Debug, Clone, PartialEq)]
pub enum Error {
    NotFound(u64),
    Invalid { input: String },
    Closed,
}

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{self:?}")
    }
}

impl std::error::Error for Error {}

impl Error {
    /// Whether retrying can help.
    pub fn is_retryable(&self) -> bool {
        matches!(self, Error::Closed)
    }
}

pub type Result<T> = std::result::Result<T, Error>;
