use crate::util::is_word;

/// A lexical token.
#[derive(Debug, Clone, PartialEq)]
pub enum Token {
    Word(String),
    Space,
    Newline,
}

/// Splits text into tokens.
pub struct Lexer<'a> {
    text: &'a str,
    pos: usize,
}

impl<'a> Lexer<'a> {
    pub fn new(text: &'a str) -> Self {
        Lexer { text, pos: 0 }
    }
}

impl<'a> Iterator for Lexer<'a> {
    type Item = Token;
    fn next(&mut self) -> Option<Token> {
        let rest = &self.text[self.pos..];
        let c = rest.chars().next()?;
        self.pos += c.len_utf8();
        Some(if is_word(c) { Token::Word(c.to_string()) } else { Token::Space })
    }
}
