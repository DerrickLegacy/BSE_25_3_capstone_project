-- ==========================================
-- PostgreSQL sample data loader for authors
-- ==========================================

-- Create the authors table if it doesn't exist
CREATE TABLE IF NOT EXISTS authors (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    middle_name VARCHAR(255),
    last_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Only insert sample data if the table is empty
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM authors) THEN
        INSERT INTO authors (first_name, middle_name, last_name) VALUES
        ('William', NULL, 'Shakespeare'),
        ('Edgar', 'Allan', 'Poe'),
        ('Fyodor', NULL, 'Dostoyevsky'),
        ('Gabriel', NULL, 'Garcia Marquez'),
        ('Jane', NULL, 'Austen'),
        ('Mark', NULL, 'Twain'),
        ('Charles', NULL, 'Dickens'),
        ('Leo', NULL, 'Tolstoy'),
        ('Herman', NULL, 'Melville'),
        ('Virginia', NULL, 'Woolf'),
        ('George', NULL, 'Orwell'),
        ('Harper', NULL, 'Lee'),
        ('F. Scott', NULL, 'Fitzgerald'),
        ('J.K.', NULL, 'Rowling'),
        ('Ernest', NULL, 'Hemingway'),
        ('Toni', NULL, 'Morrison'),
        ('John', NULL, 'Steinbeck'),
        ('Emily', NULL, 'Bronte'),
        ('James', NULL, 'Joyce'),
        ('Miguel', 'de', 'Cervantes');
    END IF;
END
$$;
