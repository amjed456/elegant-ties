'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Product, getProducts, getCollections } from '@/lib/products'
import { Edit, Trash2, Phone } from 'lucide-react'

// Define interfaces for site content
interface HeroContent {
  title?: string;
  subtitle?: string;
  image_url?: string;
  [key: string]: any;
}

interface AboutContent {
  title?: string;
  description?: string;
  image_url?: string;
  [key: string]: any;
}

type SiteContent = HeroContent | AboutContent;

// Define interface for site settings
interface SiteSettings {
  whatsapp_number: string;
  facebook_url: string;
  instagram_url: string;
  phone_number: string;
  tiktok_url: string;
  [key: string]: any;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  
  // Admin credentials - in production, use environment variables
  const ADMIN_USERNAME = 'amjed456'
  const ADMIN_PASSWORD = 'amjed123X' // Change this to a strong password
  
  const [products, setProducts] = useState<Product[]>([])
  const [collections, setCollections] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    is_featured: false,
    collection_id: null as number | null
  })
  const [isUploading, setIsUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [newCollection, setNewCollection] = useState({
    name: '',
    description: '',
    image_url: ''
  })
  const [siteContentKey, setSiteContentKey] = useState('hero')
  const [siteContent, setSiteContent] = useState<SiteContent>({})
  
  // Edit states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingCollection, setEditingCollection] = useState<any | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Add state for site settings
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({ 
    whatsapp_number: '',
    facebook_url: '',
    instagram_url: '',
    phone_number: '',
    tiktok_url: ''
  })

  // Handle login attempt
  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      setAuthError('')
      // Load data after authentication
      loadData()
    } else {
      setAuthError('Invalid username or password')
    }
  }
  
  async function loadData() {
    try {
      const productsData = await getProducts()
      const collectionsData = await getCollections()
      
      console.log("Admin - Loaded products:", productsData);
      console.log("Admin - Loaded collections with raw IDs:", collectionsData.map(c => ({ id: c.id, name: c.name })));
      
      // Log collection ID to name mapping for debugging
      const collectionMap: Record<string, string> = {};
      collectionsData.forEach(c => {
        collectionMap[String(c.id)] = c.name;
      });
      console.log("Collection ID to Name mapping:", collectionMap);
      
      setProducts(productsData)
      setCollections(collectionsData)
      
      // Load site settings
      await loadSiteSettings()
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Only load data if authenticated
  useEffect(() => {
    // Check if already authenticated from previous session
    const storedAuth = localStorage.getItem('easyTieAdminAuth')
    if (storedAuth === 'true') {
      setIsAuthenticated(true)
      loadData()
    } else {
      setIsLoading(false)
    }
  }, [])
  
  // Save authentication state to localStorage
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('easyTieAdminAuth', 'true')
    }
  }, [isAuthenticated])
  
  // Logout function
  function handleLogout() {
    setIsAuthenticated(false)
    localStorage.removeItem('easyTieAdminAuth')
  }

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files || event.target.files.length === 0) {
      return
    }
    
    const file = event.target.files[0]
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
    const filePath = `products/${fileName}`
    
    setIsUploading(true)
    setMessage('Uploading image...')
    
    try {
      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file)
      
      if (uploadError) {
        throw uploadError
      }
      
      // Get the public URL
      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)
      
      if (data) {
        if (isEditing && editingProduct) {
          setEditingProduct({
            ...editingProduct,
            image_url: data.publicUrl
          })
        } else {
          setNewProduct({
            ...newProduct,
            image_url: data.publicUrl
          })
        }
        setMessage('Image uploaded successfully!')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      setMessage('Error uploading image')
    } finally {
      setIsUploading(false)
    }
  }

  // Add a function to map between URL/display IDs and database IDs
  function getCollectionUrlId(dbId: number | null): number | null {
    // Map from DB ID to URL/display ID
    switch(dbId) {
      case 1: return 3; // Premium -> Display ID 3
      case 2: return 4; // Luxury -> Display ID 4
      case 3: return 1; // Basic -> Display ID 1
      case 4: return 2; // Standard -> Display ID 2
      default: return dbId;
    }
  }
  
  // @ts-ignore - Keeping for future use
  function getCollectionDbId(urlId: number | null): number | null {
    // Map from URL/display ID to DB ID
    switch(urlId) {
      case 1: return 3; // Display ID 1 -> Basic (DB ID 3)
      case 2: return 4; // Display ID 2 -> Standard (DB ID 4)
      case 3: return 1; // Display ID 3 -> Premium (DB ID 1)
      case 4: return 2; // Display ID 4 -> Luxury (DB ID 2)
      default: return urlId;
    }
  }

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault()
    
    // Add detailed logging
    console.log("Adding product with collection_id:", newProduct.collection_id);
    const selectedCollection = collections.find(c => c.id === newProduct.collection_id);
    console.log("Selected collection details:", selectedCollection ? {
      id: selectedCollection.id,
      name: selectedCollection.name,
      displayId: getCollectionUrlId(selectedCollection.id as number)
    } : "No collection selected");
    
    // Log all collections for reference
    console.log("Available collections:", collections.map(c => ({
      id: c.id,
      name: c.name,
      displayId: getCollectionUrlId(c.id as number)
    })));
    
    try {
      const { error } = await supabase
        .from('products')
        .insert({
          name: newProduct.name,
          description: newProduct.description,
          price: newProduct.price,
          image_url: newProduct.image_url,
          is_featured: newProduct.is_featured,
          collection_id: newProduct.collection_id
        })
      
      if (error) {
        throw error
      }
      
      // Get the inserted product to verify its collection_id
      const { data: newData, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('name', newProduct.name)
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (fetchError) {
        console.error("Error fetching new product:", fetchError);
      } else if (newData && newData.length > 0) {
        console.log("Newly added product with collection_id:", {
          id: newData[0].id,
          name: newData[0].name,
          collection_id: newData[0].collection_id,
          display_collection_id: getCollectionUrlId(newData[0].collection_id)
        });
      }
      
      // Refresh products list
      const updatedProducts = await getProducts()
      setProducts(updatedProducts)
      
      // Reset form
      setNewProduct({
        name: '',
        description: '',
        price: '',
        image_url: '',
        is_featured: false,
        collection_id: null
      })
      
      setMessage('Product added successfully!')
    } catch (error) {
      console.error('Error adding product:', error)
      setMessage('Error adding product')
    }
  }

  async function handleUpdateProduct(e: React.FormEvent) {
    e.preventDefault()
    
    if (!editingProduct) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: editingProduct.name,
          description: editingProduct.description,
          price: editingProduct.price,
          image_url: editingProduct.image_url,
          is_featured: editingProduct.is_featured,
          collection_id: editingProduct.collection_id
        })
        .eq('id', editingProduct.id)
      
      if (error) {
        throw error
      }
      
      // Refresh products list
      const updatedProducts = await getProducts()
      setProducts(updatedProducts)
      
      // Reset edit state
      setEditingProduct(null)
      setIsEditing(false)
      
      setMessage('Product updated successfully!')
    } catch (error) {
      console.error('Error updating product:', error)
      setMessage('Error updating product')
    }
  }

  async function handleDeleteProduct(id: number) {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Refresh products list
      const updatedProducts = await getProducts();
      setProducts(updatedProducts);
      setMessage('Product deleted successfully!');
    } catch (error) {
      console.error('Error deleting product:', error);
      setMessage('Error deleting product');
    }
  }

  async function handleAddCollection(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('collections')
        .insert({
          name: newCollection.name,
          description: newCollection.description,
          image_url: newCollection.image_url
        });
      
      if (error) throw error;
      
      // Refresh collections list
      const updatedCollections = await getCollections();
      setCollections(updatedCollections);
      
      // Reset form
      setNewCollection({
        name: '',
        description: '',
        image_url: ''
      });
      
      setMessage('Collection added successfully!');
    } catch (error) {
      console.error('Error adding collection:', error);
      setMessage('Error adding collection');
    }
  }

  async function handleUpdateCollection(e: React.FormEvent) {
    e.preventDefault();
    
    if (!editingCollection) return;
    
    try {
      const { error } = await supabase
        .from('collections')
        .update({
          name: editingCollection.name,
          description: editingCollection.description,
          image_url: editingCollection.image_url
        })
        .eq('id', editingCollection.id);
      
      if (error) throw error;
      
      // Refresh collections list
      const updatedCollections = await getCollections();
      setCollections(updatedCollections);
      
      // Reset edit state
      setEditingCollection(null);
      setIsEditing(false);
      
      setMessage('Collection updated successfully!');
    } catch (error) {
      console.error('Error updating collection:', error);
      setMessage('Error updating collection');
    }
  }

  async function handleDeleteCollection(id: number) {
    try {
      const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Refresh collections list
      const updatedCollections = await getCollections();
      setCollections(updatedCollections);
      setMessage('Collection deleted successfully!');
    } catch (error) {
      console.error('Error deleting collection:', error);
      setMessage('Error deleting collection');
    }
  }

  async function loadSiteContent() {
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .eq('key', siteContentKey)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setSiteContent(data.content as SiteContent);
      } else {
        // Initialize with empty object based on type
        setSiteContent(siteContentKey === 'hero' ? 
          { title: '', subtitle: '', image_url: '' } : 
          { title: '', description: '', image_url: '' }
        );
      }
    } catch (error) {
      console.error('Error loading site content:', error);
    }
  }

  // Load content when siteContentKey changes
  useEffect(() => {
    loadSiteContent();
  }, [siteContentKey]);

  async function handleSaveSiteContent(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      const { data, error: selectError } = await supabase
        .from('site_content')
        .select('*')
        .eq('key', siteContentKey)
        .single();
      
      if (selectError && selectError.code !== 'PGRST116') throw selectError;
      
      if (data) {
        // Update existing
        const { error } = await supabase
          .from('site_content')
          .update({ content: siteContent })
          .eq('key', siteContentKey);
        
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('site_content')
          .insert({
            key: siteContentKey,
            content: siteContent
          });
        
        if (error) throw error;
      }
      
      setMessage('Site content updated successfully!');
    } catch (error) {
      console.error('Error saving site content:', error);
      setMessage('Error saving site content');
    }
  }

  // Function to load site settings
  async function loadSiteSettings() {
    try {
      // First check if the site_settings table exists
      const { data: tableInfo, error: tableError } = await supabase
        .from('site_settings')
        .select('count')
        .limit(1);
      
      if (tableError) {
        console.error("Error checking site_settings table:", tableError);
        // Initialize with default values even if table doesn't exist
        setSiteSettings({ 
          whatsapp_number: '',
          facebook_url: '',
          instagram_url: '',
          phone_number: '',
          tiktok_url: ''
        });
        return;
      }
      
      // If we got here, try to get the actual settings
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error("Error loading site settings:", error);
        setSiteSettings({ 
          whatsapp_number: '',
          facebook_url: '',
          instagram_url: '',
          phone_number: '',
          tiktok_url: ''
        });
        return;
      }
      
      if (data) {
        setSiteSettings(data.settings as SiteSettings);
      } else {
        // Initialize with default values
        setSiteSettings({ 
          whatsapp_number: '',
          facebook_url: '',
          instagram_url: '',
          phone_number: '',
          tiktok_url: ''
        });
      }
    } catch (error) {
      console.error("Error loading site settings:", error);
      setSiteSettings({ 
        whatsapp_number: '',
        facebook_url: '',
        instagram_url: '',
        phone_number: '',
        tiktok_url: ''
      });
    }
  }
  
  // Function to save site settings
  async function handleSaveSiteSettings(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      // First check if the site_settings table exists
      const { data: tableExists, error: tableError } = await supabase
        .from('site_settings')
        .select('count')
        .limit(1);
      
      if (tableError && tableError.code?.includes('42P01')) {
        // Table doesn't exist, show a helpful message
        console.error("Site settings table doesn't exist");
        setMessage('Error: The site_settings table does not exist. Please create it in the Supabase dashboard with columns: id (int8), settings (jsonb), created_at (timestamp)');
        return;
      }
      
      // Normal flow - first check if settings exist
      const { data, error: selectError } = await supabase
        .from('site_settings')
        .select('*')
        .single();
      
      if (selectError && selectError.code !== 'PGRST116') {
        console.error("Error checking site settings:", selectError);
        setMessage('Error checking existing settings');
        return;
      }
      
      if (data) {
        // Update existing
        const { error } = await supabase
          .from('site_settings')
          .update({ settings: siteSettings })
          .eq('id', data.id);
        
        if (error) {
          console.error("Error updating site settings:", error);
          setMessage('Error updating site settings');
          return;
        }
      } else {
        // Insert new
        const { error } = await supabase
          .from('site_settings')
          .insert({
            settings: siteSettings
          });
        
        if (error) {
          console.error("Error inserting site settings:", error);
          setMessage('Error inserting site settings');
          return;
        }
      }
      
      setMessage('Site settings updated successfully!');
    } catch (error) {
      console.error("Error saving site settings:", error);
      setMessage('Error saving site settings');
    }
  }

  if (isLoading) {
    return <div className="container py-12">Loading...</div>
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-12 max-w-md">
        <h1 className="text-3xl font-bold mb-8 text-center">Admin Login</h1>
        
        <form onSubmit={handleLogin} className="space-y-4 border p-6 rounded-lg shadow-md">
          {authError && (
            <p className="text-red-500 text-sm">{authError}</p>
          )}
          
          <div>
            <Label htmlFor="username">Username</Label>
            <Input 
              id="username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
            />
          </div>
          
          <div>
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          
          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>
      </div>
    )
  }

  // Admin dashboard when authenticated
  return (
    <div className="container py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>
      
      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="content">Site Content</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="products" className="mt-6">
          {isEditing && editingProduct ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Edit Product</h2>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingProduct(null);
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
          
              <form onSubmit={handleUpdateProduct} className="space-y-4 max-w-2xl mb-8">
                <div>
                  <Label htmlFor="edit-name">Product Name</Label>
                  <Input 
                    id="edit-name" 
                    value={editingProduct.name} 
                    onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})} 
                    required 
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea 
                    id="edit-description" 
                    value={editingProduct.description} 
                    onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})} 
                    required 
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-price">Price</Label>
                  <Input 
                    id="edit-price" 
                    value={editingProduct.price} 
                    onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})} 
                    required 
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-image">Image</Label>
                  <Input 
                    id="edit-image" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    disabled={isUploading}
                  />
                  {editingProduct.image_url && (
                    <div className="mt-2">
                      <img src={editingProduct.image_url} alt="Preview" className="h-40 object-contain" />
                    </div>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="edit-collection">Collection</Label>
                  <select 
                    id="edit-collection"
                    value={editingProduct.collection_id !== null ? editingProduct.collection_id : ''}
                    onChange={(e) => {
                      const newValue = e.target.value ? Number(e.target.value) : null;
                      console.log("Editing - Selected collection ID:", newValue);
                      setEditingProduct({
                        ...editingProduct, 
                        collection_id: newValue
                      });
                    }}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">None</option>
                    {collections.map((collection) => {
                      // Map the actual DB ID to display ID for clarity
                      const displayId = getCollectionUrlId(collection.id as number);
                      
                      return (
                        <option key={collection.id} value={collection.id}>
                          {collection.name} (Display ID: {displayId})
                        </option>
                      );
                    })}
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input 
                    id="edit-featured" 
                    type="checkbox" 
                    checked={editingProduct.is_featured} 
                    onChange={(e) => setEditingProduct({...editingProduct, is_featured: e.target.checked})} 
                    className="h-4 w-4"
                  />
                  <Label htmlFor="edit-featured">Featured Product</Label>
                </div>
                
                <Button type="submit" disabled={isUploading} className="mt-4">
                  Update Product
                </Button>
                
                {message && <p className="mt-2 text-sm">{message}</p>}
              </form>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-4">Add New Product</h2>
          
              <form onSubmit={handleAddProduct} className="space-y-4 max-w-2xl mb-8">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input 
                    id="name" 
                    value={newProduct.name} 
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} 
                    required 
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    value={newProduct.description} 
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} 
                    required 
                  />
                </div>
                
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input 
                    id="price" 
                    value={newProduct.price} 
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} 
                    required 
                  />
                </div>
                
                <div>
                  <Label htmlFor="image">Image</Label>
                  <Input 
                    id="image" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    disabled={isUploading}
                  />
                  {newProduct.image_url && (
                    <div className="mt-2">
                      <img src={newProduct.image_url} alt="Preview" className="h-40 object-contain" />
                    </div>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="collection">Collection</Label>
                  <select 
                    id="collection"
                    value={newProduct.collection_id !== null ? newProduct.collection_id : ''}
                    onChange={(e) => {
                      const newValue = e.target.value ? Number(e.target.value) : null;
                      console.log("Selected collection ID:", newValue);
                      setNewProduct({
                        ...newProduct, 
                        collection_id: newValue
                      });
                    }}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">None</option>
                    {collections.map((collection) => {
                      // Map the actual DB ID to display ID for clarity
                      const displayId = getCollectionUrlId(collection.id as number);
                      
                      return (
                        <option key={collection.id} value={collection.id}>
                          {collection.name} (Display ID: {displayId}, Actual DB ID: {collection.id})
                        </option>
                      );
                    })}
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input 
                    id="featured" 
                    type="checkbox" 
                    checked={newProduct.is_featured} 
                    onChange={(e) => setNewProduct({...newProduct, is_featured: e.target.checked})} 
                    className="h-4 w-4"
                  />
                  <Label htmlFor="featured">Featured Product</Label>
                </div>
                
                <Button type="submit" disabled={isUploading} className="mt-4">
                  Add Product
                </Button>
                
                {message && <p className="mt-2 text-sm">{message}</p>}
              </form>
            </>
          )}
          
          <h2 className="text-2xl font-bold mb-4">Existing Products</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="border p-4 rounded-md">
                <div className="relative h-48 mb-4">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="h-full w-full object-contain" />
                  ) : (
                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">No Image</div>
                  )}
                </div>
                <h3 className="font-bold">{product.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{product.description}</p>
                <p className="font-medium">{product.price}</p>
                {product.collection_id && (
                  <p className="text-sm mt-1">
                    <span className="font-medium">Collection: </span>
                    {collections.find(c => String(c.id) === String(product.collection_id))?.name || 'Unknown'}
                  </p>
                )}
                {product.is_featured && (
                  <span className="inline-block mt-2 px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded">
                    Featured
                  </span>
                )}
                <div className="flex mt-3 space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setEditingProduct(product);
                      setIsEditing(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="collections" className="mt-6">
          {editingCollection ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Edit Collection</h2>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingCollection(null);
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
          
              <form onSubmit={handleUpdateCollection} className="space-y-4 max-w-2xl mb-8">
                <div>
                  <Label htmlFor="edit-collection-name">Collection Name</Label>
                  <Input 
                    id="edit-collection-name" 
                    value={editingCollection.name} 
                    onChange={(e) => setEditingCollection({...editingCollection, name: e.target.value})} 
                    required 
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-collection-description">Description</Label>
                  <Textarea 
                    id="edit-collection-description" 
                    value={editingCollection.description} 
                    onChange={(e) => setEditingCollection({...editingCollection, description: e.target.value})} 
                    required 
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-collection-image">Image URL</Label>
                  <Input 
                    id="edit-collection-image" 
                    value={editingCollection.image_url} 
                    onChange={(e) => setEditingCollection({...editingCollection, image_url: e.target.value})} 
                    required 
                  />
                  {editingCollection.image_url && (
                    <div className="mt-2">
                      <img src={editingCollection.image_url} alt="Preview" className="h-40 object-contain" />
                    </div>
                  )}
                </div>
                
                <Button type="submit" className="mt-4">
                  Update Collection
                </Button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-4">Add New Collection</h2>
          
              <form onSubmit={handleAddCollection} className="space-y-4 max-w-2xl mb-8">
                <div>
                  <Label htmlFor="collection-name">Collection Name</Label>
                  <Input 
                    id="collection-name" 
                    value={newCollection.name} 
                    onChange={(e) => setNewCollection({...newCollection, name: e.target.value})} 
                    required 
                  />
                </div>
                
                <div>
                  <Label htmlFor="collection-description">Description</Label>
                  <Textarea 
                    id="collection-description" 
                    value={newCollection.description} 
                    onChange={(e) => setNewCollection({...newCollection, description: e.target.value})} 
                    required 
                  />
                </div>
                
                <div>
                  <Label htmlFor="collection-image">Image URL</Label>
                  <Input 
                    id="collection-image" 
                    value={newCollection.image_url} 
                    onChange={(e) => setNewCollection({...newCollection, image_url: e.target.value})} 
                    required 
                  />
                  {newCollection.image_url && (
                    <div className="mt-2">
                      <img src={newCollection.image_url} alt="Preview" className="h-40 object-contain" />
                    </div>
                  )}
                </div>
                
                <Button type="submit" className="mt-4">
                  Add Collection
                </Button>
              </form>
            </>
          )}
          
          <h2 className="text-2xl font-bold mb-4">Existing Collections</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <div key={collection.id} className="border p-4 rounded-md">
                <div className="relative h-48 mb-4">
                  {collection.image_url ? (
                    <img src={collection.image_url} alt={collection.name} className="h-full w-full object-contain" />
                  ) : (
                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">No Image</div>
                  )}
                </div>
                <h3 className="font-bold">{collection.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{collection.description}</p>
                
                {/* Display product count for each collection */}
                <p className="text-sm mt-1">
                  <span className="font-medium">Products: </span>
                  {products.filter(p => String(p.collection_id) === String(collection.id)).length}
                </p>
                
                <div className="flex mt-3 space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setEditingCollection(collection);
                      setIsEditing(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleDeleteCollection(collection.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="content" className="mt-6">
          <h2 className="text-2xl font-bold mb-4">Site Content Management</h2>
          
          <div className="mb-4">
            <Label htmlFor="content-key">Content Section</Label>
            <select 
              id="content-key"
              value={siteContentKey}
              onChange={(e) => {
                setSiteContentKey(e.target.value);
              }}
              className="w-full p-2 border rounded mt-1"
            >
              <option value="hero">Hero Section</option>
              <option value="about">About Section</option>
            </select>
          </div>
          
          {siteContentKey === 'hero' && (
            <form onSubmit={handleSaveSiteContent} className="space-y-4 max-w-2xl">
              <div>
                <Label htmlFor="hero-title">Title</Label>
                <Input 
                  id="hero-title" 
                  value={(siteContent as HeroContent).title || ''} 
                  onChange={(e) => setSiteContent({...siteContent, title: e.target.value})} 
                  required 
                />
              </div>
              
              <div>
                <Label htmlFor="hero-subtitle">Subtitle</Label>
                <Textarea 
                  id="hero-subtitle" 
                  value={(siteContent as HeroContent).subtitle || ''} 
                  onChange={(e) => setSiteContent({...siteContent, subtitle: e.target.value})} 
                  required 
                />
              </div>
              
              <div>
                <Label htmlFor="hero-image">Image URL</Label>
                <Input 
                  id="hero-image" 
                  value={(siteContent as HeroContent).image_url || ''} 
                  onChange={(e) => setSiteContent({...siteContent, image_url: e.target.value})} 
                  required 
                />
                {(siteContent as HeroContent).image_url && (
                  <div className="mt-2">
                    <img src={(siteContent as HeroContent).image_url} alt="Preview" className="h-40 object-contain" />
                  </div>
                )}
              </div>
              
              <Button type="submit" className="mt-4">
                Save Changes
              </Button>
            </form>
          )}
          
          {siteContentKey === 'about' && (
            <form onSubmit={handleSaveSiteContent} className="space-y-4 max-w-2xl">
              <div>
                <Label htmlFor="about-title">Title</Label>
                <Input 
                  id="about-title" 
                  value={(siteContent as AboutContent).title || ''} 
                  onChange={(e) => setSiteContent({...siteContent, title: e.target.value})} 
                  required 
                />
              </div>
              
              <div>
                <Label htmlFor="about-description">Description</Label>
                <Textarea 
                  id="about-description" 
                  value={(siteContent as AboutContent).description || ''} 
                  onChange={(e) => setSiteContent({...siteContent, description: e.target.value})} 
                  required 
                />
              </div>
              
              <div>
                <Label htmlFor="about-image">Image URL</Label>
                <Input 
                  id="about-image" 
                  value={(siteContent as AboutContent).image_url || ''} 
                  onChange={(e) => setSiteContent({...siteContent, image_url: e.target.value})} 
                  required 
                />
                {(siteContent as AboutContent).image_url && (
                  <div className="mt-2">
                    <img src={(siteContent as AboutContent).image_url} alt="Preview" className="h-40 object-contain" />
                  </div>
                )}
              </div>
              
              <Button type="submit" className="mt-4">
                Save Changes
              </Button>
            </form>
          )}
        </TabsContent>
        
        <TabsContent value="settings" className="mt-6">
          <h2 className="text-2xl font-bold mb-4">Site Settings</h2>
          
          <form onSubmit={handleSaveSiteSettings} className="space-y-4 max-w-2xl">
            <div>
              <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
              <div className="flex items-center mt-1">
                <Phone className="h-4 w-4 mr-2 text-gray-500" />
                <Input 
                  id="whatsapp_number" 
                  value={siteSettings.whatsapp_number} 
                  onChange={(e) => setSiteSettings({...siteSettings, whatsapp_number: e.target.value})} 
                  placeholder="e.g. 12345678900 (international format without + sign)"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter your WhatsApp number in international format without any special characters (e.g., 12345678900 for a US number +1 234 567 8900)
              </p>
            </div>
            
            <div>
              <Label htmlFor="phone_number">Phone Number</Label>
              <div className="flex items-center mt-1">
                <Phone className="h-4 w-4 mr-2 text-gray-500" />
                <Input 
                  id="phone_number" 
                  value={siteSettings.phone_number} 
                  onChange={(e) => setSiteSettings({...siteSettings, phone_number: e.target.value})} 
                  placeholder="e.g. +1 234 567 8900"
                  className="flex-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="facebook_url">Facebook Page URL</Label>
              <Input 
                id="facebook_url" 
                value={siteSettings.facebook_url} 
                onChange={(e) => setSiteSettings({...siteSettings, facebook_url: e.target.value})} 
                placeholder="e.g. https://facebook.com/yourbusiness"
                className="flex-1"
              />
            </div>
            
            <div>
              <Label htmlFor="instagram_url">Instagram Profile URL</Label>
              <Input 
                id="instagram_url" 
                value={siteSettings.instagram_url} 
                onChange={(e) => setSiteSettings({...siteSettings, instagram_url: e.target.value})} 
                placeholder="e.g. https://instagram.com/yourbusiness"
                className="flex-1"
              />
            </div>
            
            <div>
              <Label htmlFor="tiktok_url">TikTok Profile URL</Label>
              <Input 
                id="tiktok_url" 
                value={siteSettings.tiktok_url} 
                onChange={(e) => setSiteSettings({...siteSettings, tiktok_url: e.target.value})} 
                placeholder="e.g. https://tiktok.com/@yourbusiness"
                className="flex-1"
              />
            </div>
            
            <Button type="submit" className="mt-4">
              Save Settings
            </Button>
            
            {message && <p className="mt-2 text-sm">{message}</p>}
          </form>
        </TabsContent>
      </Tabs>
    </div>
  )
} 