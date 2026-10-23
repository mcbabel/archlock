use shop_core::parse_price;

#[test]
fn works() {
    assert!(parse_price("1").is_ok());
}
