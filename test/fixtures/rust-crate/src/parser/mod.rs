pub mod ast;

use crate::lexer::{Lexer, Token};

/// Builds a document from tokens.
pub struct Parser<'a> {
    lexer: Lexer<'a>,
}

impl<'a> Parser<'a> {
    pub fn new(lexer: Lexer<'a>) -> Self {
        Parser { lexer }
    }

    pub fn document(mut self) -> ast::Document {
        let mut words = Vec::new();
        while let Some(t) = self.lexer.next() {
            if let Token::Word(w) = t {
                words.push(w);
            }
        }
        ast::Document { words }
    }
}
