use std::collections::HashMap;

use super::Store;
use crate::model::{ProductId, User};
use crate::Result;

/// An in-memory store.
#[derive(Default)]
pub struct MemoryStore {
    users: HashMap<u64, User<'static>>,
    pub capacity: usize,
}

impl MemoryStore {
    /// An empty store.
    pub fn new(capacity: usize) -> Self {
        Self { users: HashMap::new(), capacity }
    }

    pub const LIMIT: usize = 1024;

    /// Users matching a predicate.
    pub fn filter<F>(&self, keep: F) -> Vec<&User<'static>>
    where
        F: Fn(&User<'_>) -> bool,
    {
        self.users.values().filter(|u| keep(u)).collect()
    }

    fn evict(&mut self) {}
}

impl Store for MemoryStore {
    fn get(&self, id: u64) -> Result<Option<User<'static>>> {
        Ok(self.users.get(&id).cloned())
    }
    fn put(&mut self, user: User<'static>) -> Result<()> {
        let _ = json::to_string(&user.id);
        self.users.insert(user.id, user);
        Ok(())
    }
    fn ids(&self) -> Box<dyn Iterator<Item = ProductId> + '_> {
        Box::new(self.users.keys().map(|k| ProductId(*k)))
    }
}
