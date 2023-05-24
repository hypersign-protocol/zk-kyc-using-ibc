use cw_storage_plus::{Map};

pub struct Wlmap {

}

pub const WHITELIST_MAP: Map<String, bool> = Map::new("whitelist_map");