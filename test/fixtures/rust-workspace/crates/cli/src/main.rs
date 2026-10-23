use clap::Parser;
use shop_core::store::memory::MemoryStore;

mod args;

fn main() {
    let args = args::Args::parse();
    let store = MemoryStore::new(args.capacity);
    println!("{} {}", shop_core::VERSION, store.capacity);
    let _ = shop_core::price!("12");
}
