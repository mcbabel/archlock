pub(crate) fn is_word(c: char) -> bool {
    unicode_width::UnicodeWidthChar::width(c).is_some() && c.is_alphanumeric()
}

pub fn width(text: &str) -> usize {
    text.chars().count()
}
