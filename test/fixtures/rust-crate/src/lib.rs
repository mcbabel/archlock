//! Text processing.

pub mod lexer;
pub mod parser;
mod util;

pub use lexer::{Lexer, Token};

/// Parses a whole document.
pub fn parse(text: &str) -> parser::ast::Document {
    parser::Parser::new(Lexer::new(text)).document()
}
