fn main() {
    let doc = textkit::parse("hello world");
    println!("{}", doc.words.len());
}
