-- Create hero_banners table
CREATE TABLE hero_banners (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    button_text VARCHAR(100),
    button_link VARCHAR(255),
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for ordering
CREATE INDEX idx_hero_banners_order ON hero_banners(order_index);

-- Create RLS policies
ALTER TABLE hero_banners ENABLE ROW LEVEL SECURITY;

-- Policy for public read access
CREATE POLICY "Allow public read access" 
ON hero_banners FOR SELECT 
TO public 
USING (is_active = true);

-- Policy for admin write access
CREATE POLICY "Allow admin write access" 
ON hero_banners FOR ALL 
TO authenticated 
USING (
    (SELECT is_admin FROM users WHERE id = auth.uid())
) 
WITH CHECK (
    (SELECT is_admin FROM users WHERE id = auth.uid())
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_hero_banners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_hero_banners_updated_at
    BEFORE UPDATE ON hero_banners
    FOR EACH ROW
    EXECUTE FUNCTION update_hero_banners_updated_at();

-- Insert initial data
INSERT INTO hero_banners (title, description, image_url, button_text, button_link, order_index)
VALUES 
    ('Moda Atemporal, Sofisticada e Moderna', 'Peças leves e elegantes para os dias mais frios', 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1374', 'Garanta seu Look Agora!', '/colecao', 1),
    ('Moda Atemporal, Sofisticada e Moderna', 'Complete seu look com nossas peças selecionadas', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1470', 'Nova coleção disponível!', '/colecao?categoria=acessorios', 2),
    ('Moda Atemporal, Sofisticada e Moderna', 'Descubra as peças que serão tendência nesta estação', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1470', 'Nova coleção disponível!', '/colecao?novidades=true', 3); 