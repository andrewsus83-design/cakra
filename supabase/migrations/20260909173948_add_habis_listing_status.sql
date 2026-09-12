-- 'Habis' status (developer sold-out) requested for listings; enum lacked it.
alter type listing_status_t add value if not exists 'habis';;
