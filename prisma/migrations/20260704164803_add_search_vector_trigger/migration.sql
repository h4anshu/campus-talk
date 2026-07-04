-- Create trigger function
CREATE OR REPLACE FUNCTION post_search_vector_trigger() RETURNS trigger AS $$
BEGIN
  NEW."searchVector" := to_tsvector('english', COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.body, ''));
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

-- Create trigger on the Post table
DROP TRIGGER IF EXISTS post_search_vector_update ON "Post";
CREATE TRIGGER post_search_vector_update
BEFORE INSERT OR UPDATE ON "Post"
FOR EACH ROW
EXECUTE FUNCTION post_search_vector_trigger();

-- Backfill searchVector for existing posts
UPDATE "Post" SET "title" = "title";

-- Create GIN index on Post table for searchVector column
CREATE INDEX IF NOT EXISTS "Post_searchVector_idx" ON "Post" USING GIN("searchVector");