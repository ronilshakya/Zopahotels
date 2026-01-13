import React, { useEffect, useState } from 'react';
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Swal from "sweetalert2";
import { IoIosArrowForward } from "react-icons/io";
import { IoCloudUploadOutline } from "react-icons/io5";
import Button from "../../components/Button"
import { API_URL } from '../../config';
import preloader from '../../assets/preloader.gif'
import { 
    getCategories,
    addCategory,
    getSubCategory,
    addSubCategory,
    getItems,
    addItem,
    deleteCategory,
    deleteSubCategory,
    deleteItem,
    updateCategory,
    updateSubCategory,
    updateItem
} from '../../api/posApi'

const POSCatalog = () => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState("");
    const [newCategoryDescription, setNewCategoryDescription] = useState("");

    const [subCategories, setSubCategories] = useState([]);
    const [newSubCategory, setNewSubCategory] = useState("");
    const [newSubCategoryParent, setNewSubCategoryParent] = useState("");
    const [newSubCategoryDescription, setNewSubCategoryDescription] = useState("");

    const [selectedCategoryListItem, setSelectedCategoryListItem] = useState(null);
    const [selectedSubCategoryListItem, setSelectedSubCategoryListItem] = useState(null);

    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState("");
    const [newItemPrice, setNewItemPrice] = useState(null);
    const [newItemImage, setNewItemImage] = useState(null);
    const [newItemParentCategory, setNewItemParentCategory] = useState("");
    const [newItemSubCategory, setNewItemSubCategory] = useState("");
    const [newItemDescription, setNewItemDescription] = useState("");
    const [subCategoryListForNewItem, setSubCategoryListForNewItem] = useState([])
    const [previewUrl, setPreviewUrl] = useState(null)

    const [subCategoryLoading,setSubCategoryLoading] = useState(false);
    const [itemsLoading, setItemsLoading] = useState(false);

    const token = localStorage.getItem("adminToken");
    const [activeTab, setActiveTab] = useState("add-item");

    const [editingCategory, setEditingCategory] = useState(null);
    const [editingSubCategory, setEditingSubCategory] = useState(null);
    const [editingItem, setEditingItem] = useState(null);

    const fetchCategories = async() =>{
        try {
            const res = await getCategories(token);
            setCategories(res);
        } catch (error) {
            console.log(error);
        }
    }

     const fetchSubCategories = async (categoryId) =>{
        try {
            setSubCategoryLoading(true)
            const res = await getSubCategory(token,categoryId);
            setSubCategories(res);
            setItems([]);
        } catch (error) {
            console.log(error); 
        }finally{
            setSubCategoryLoading(false);
        }
    }

    const fetchItems = async (subCategoryId) =>{
        try {
            setItemsLoading(true);
            const res = await getItems(token,subCategoryId);
            setItems(res);
        } catch (error) {
            console.log(error);
        }finally{
            setItemsLoading(false);
        }
    }

    useEffect(()=>{
        fetchCategories();
    },[])

    useEffect(() => {
    const fetchSubs = async () => {
        if (newItemParentCategory) {
        try {
            const subs = await getSubCategory(token, newItemParentCategory);
            setSubCategoryListForNewItem(subs);
        } catch (err) {
            console.error("Error fetching subcategories:", err);
            setSubCategoryListForNewItem([]);
        }
        }else { setSubCategoryListForNewItem([]); }
    };
    fetchSubs();
    setNewItemSubCategory("");
    }, [newItemParentCategory, token]);

    
    const handleAddCategory = async (e) =>{
        e.preventDefault();
        try {
            await addCategory(token, newCategory, newCategoryDescription);
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Category Added",
                showConfirmButton: false,
                timer: 1000
            });
            setNewCategory("");
            fetchCategories();
        } catch (err) {
            Swal.fire("Error", err.response?.data?.message || err.message, "error");  
        }
    }

    const handleDeleteCategory = async (categoryId) =>{
        try {
            Swal.fire({
                title: "Do you want to delete the category?",
                showCancelButton: true,
                confirmButtonText: "Delete",
            }).then(async (result)=>{
                if (result.isConfirmed) {
                    await deleteCategory(token,categoryId);
                    Swal.fire({
                        position: "top-end",
                        icon: "success",
                        title: "Category Deleted",
                        showConfirmButton: false,
                        timer: 1000
                    });
                    fetchCategories();
                    setSelectedCategoryListItem(null);
                    setSelectedSubCategoryListItem(null);
                }
            })
        } catch (err) {
            Swal.fire("Error", err.response?.data?.message || err.message, "error");  
        }
    }

    const handleUpdateCategory = async (e) =>{
        e.preventDefault();
        try {
            await updateCategory(token,editingCategory._id,newCategory,newCategoryDescription);
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Category Updated",
                showConfirmButton: false,
                timer: 1000
            });
            setEditingCategory(null);
            setNewCategory("");
            setNewCategoryDescription("");
            fetchCategories()
        } catch (err) {
            Swal.fire("Error", err.response?.data?.message || err.message, "error");
        }
    }

    const handleAddSubCategories = async (e) =>{
        e.preventDefault();
        try {
            await addSubCategory(token,newSubCategory,newSubCategoryParent,newSubCategoryDescription);
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Sub Category Added",
                showConfirmButton: false,
                timer: 1000
            });
            setNewSubCategory("");
            fetchSubCategories(selectedCategoryListItem);
        } catch (err) {
            Swal.fire("Error", err.response?.data?.message || err.message, "error"); 
        }
    }

    const handleDeleteSubCategory = async (subCategoryId) =>{
         try {
            Swal.fire({
                title: "Do you want to delete this sub category?",
                showCancelButton: true,
                confirmButtonText: "Delete",
            }).then(async (result)=>{
                if (result.isConfirmed) {
                    await deleteSubCategory(token,subCategoryId);
                    Swal.fire({
                        position: "top-end",
                        icon: "success",
                        title: "Sub Category Deleted",
                        showConfirmButton: false,
                        timer: 1000
                    });
                    fetchSubCategories(selectedCategoryListItem);
                    setSelectedSubCategoryListItem(null);
                }
            })
        } catch (err) {
            Swal.fire("Error", err.response?.data?.message || err.message, "error");  
        }
    } 

    const handleUpdateSubCategory = async (e) =>{
        e.preventDefault();
        try {
            await updateSubCategory(token,editingSubCategory._id,newSubCategory,newSubCategoryParent,newSubCategoryDescription);
             Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Sub Category Updated",
                showConfirmButton: false,
                timer: 1000
            });
            await fetchSubCategories(editingSubCategory.category)
            setEditingSubCategory(null);
            setNewSubCategory("");
            setNewSubCategoryDescription("");
        } catch (err) {
            Swal.fire("Error", err.response?.data?.message || err.message, "error");
        }
    }

    const handleAddItem= async (e) =>{
        e.preventDefault();
        try {
            await addItem(token, {
                name: newItem,
                price: newItemPrice,
                subcategoryId: newItemSubCategory,
                description: newItemDescription,
                image: newItemImage
            });

            Swal.fire({
                position: "top-end",
                icon: "success",
                title: " Item Added",
                showConfirmButton: false,
                timer: 1000
            });
            fetchItems(selectedSubCategoryListItem);
             setNewItem("");
            setNewItemPrice("");
            setNewItemDescription("");
            setNewItemParentCategory("");
            setNewItemSubCategory("")
            setNewItemImage(null); 
            setPreviewUrl(null);
        } catch (err) {
            Swal.fire("Error", err.response?.data?.message || err.message, "error"); 
        }
    }

    const handleDeleteItem = async (ItemId) =>{
        try {
            Swal.fire({
                title: "Do you want to delete this  Item?",
                showCancelButton: true,
                confirmButtonText: "Delete",
            }).then(async (result)=>{
                if (result.isConfirmed) {
                    await deleteItem(token, ItemId);
                    Swal.fire({
                        position: "top-end",
                        icon: "success",
                        title: " Item Deleted",
                        showConfirmButton: false,
                        timer: 1000
                    });
                    fetchItems(selectedSubCategoryListItem);
                }
            })
        } catch (err) {
            Swal.fire("Error", err.response?.data?.message || err.message, "error");  
        }
    }

    const handleUpdateItem = async (e) =>{
        e.preventDefault();
        try {
            await updateItem(token,editingItem._id,{
                name: newItem,
                price: newItemPrice,
                subcategory: newItemSubCategory,
                description: newItemDescription,
                image: newItemImage || undefined
            });
             Swal.fire({
                position: "top-end",
                icon: "success",
                title: " Item Updated",
                showConfirmButton: false,
                timer: 1000
            });
            await fetchItems(editingItem.subcategory._id);
            setEditingItem(null);
            setNewItem("");
            setNewItemPrice("");
            setNewItemDescription("");
            setNewItemParentCategory("");
            setNewItemSubCategory("")
            setNewItemImage(null); 
            setPreviewUrl(null);
        } catch (err) {
            Swal.fire("Error", err.response?.data?.message || err.message, "error");
        }
    }

    const tabs = [
        {id: "add-item", label: "Add Item"},
        {id: "category", label: "Category"},
        {id: "sub-category", label:"Sub Category"},
    ];

  return (
    <>
        <div className='bg-white p-4 border-b border-gray-300'>
            <h1 className='px-2 py-1 text-2xl font-bold'>POS Catalog</h1>
            <p className='px-2 py-1 text-sm text-gray-500'>Create and manage hotel  items.</p>
        </div>
    <div className="min-h-screen bg-gray-100 p-4">
        <div className='grid grid-cols-12 gap-6'>
            <div className="col-span-12 md:col-span-4">
                <div className="mx-auto px-4 py-3 border border-gray-300 bg-white rounded-2xl shadow-lg">
                    <div className='flex  border-b border-gray-300'>
                        {tabs.map((tab)=>(
                            <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-3 font-semibold cursor-pointer flex-1 ${activeTab === tab.id ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <div className='p-1'>
                        {activeTab === "add-item" && (
                            <form onSubmit={editingItem ? handleUpdateItem :handleAddItem}>
                                <h1 className='text-lg font-semibold py-2'>{editingItem ? "Update Item Details":"New Item Details"}</h1>
                                <h3 className='text-gray-600 font-semibold mb-2'>Item Image</h3>
                                <div className="border-dashed border border-gray-300 rounded-lg flex flex-col items-center p-5 mb-4 cursor-pointer">
                                    <label className="flex flex-col items-center w-full cursor-pointer">
                                        {previewUrl ? (
                                        <div className="mt-4">
                                            <img
                                            src={previewUrl}
                                            alt="Selected preview"
                                            className="w-full h-full object-cover rounded-lg border"
                                            />
                                        </div>
                                        ):(
                                            <>
                                            <div className="bg-gray-200 rounded-full p-3">
                                            <IoCloudUploadOutline size={25} />
                                            </div>
                                            <h1 className="font-semibold my-2">Click to upload</h1>
                                            <p className="text-sm text-gray-500">PNG, JPG or SVG</p>
                                            
                                            </>
                                        )}


                                        {/* Hidden file input */}
                                        <input
                                        type="file"
                                        accept="image/png, image/jpeg, image/svg+xml"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files[0]; 
                                            if (file) { 
                                                setNewItemImage(file); 
                                                setPreviewUrl(URL.createObjectURL(file));
                                            }
                                        }}
                                        />
                                    </label>
                                </div>

                                <div className='mb-4'>
                                    <h3 className='text-gray-600 font-semibold mb-2'>Item Name</h3>
                                    <input 
                                        type="text" 
                                        placeholder='e.g., Grilled Salmon'
                                        className='border-1 border-gray-300 rounded-lg w-full p-2' 
                                        onChange={(e) => setNewItem(e.target.value)}
                                        value={newItem}
                                        required
                                    />
                                </div>
                                <div className='mb-4'>
                                    <h3 className='text-gray-600 font-semibold mb-2'>Category</h3>
                                    <select 
                                        className='border-1 border-gray-300 rounded-lg w-full p-2'
                                        value={newItemParentCategory}
                                        onChange={(e)=> setNewItemParentCategory(e.target.value)}
                                        required
                                    >
                                        <option value="">-- Select a category --</option>
                                        {
                                            categories.map((category)=>(
                                                <option key={category._id} value={category._id}>
                                                    {category.name}
                                                </option>
                                            ))
                                        }
                                    </select>
                                </div>
                                <div className='grid grid-cols-2 gap-4 mb-4'>
                                    <div>
                                        <h3 className='text-gray-600 font-semibold mb-2'>Price (NPR)</h3>
                                        <input 
                                            type="text" 
                                            placeholder='00.00'
                                            className='border-1 border-gray-300 rounded-lg w-full p-2' 
                                            onChange={(e) => setNewItemPrice(Number(e.target.value))}
                                            value={newItemPrice}
                                        />
                                    </div>
                                    <div>
                                        <h3 className='text-gray-600 font-semibold mb-2'>Sub Category</h3>
                                        <select 
                                            className='border-1 border-gray-300 rounded-lg w-full p-2'
                                            value={newItemSubCategory}
                                            onChange={(e) => setNewItemSubCategory(e.target.value)}
                                            disabled={!newItemParentCategory}
                                            required
                                        >
                                            <option value="">-- Select a subcategory --</option>
                                            {subCategoryListForNewItem.length > 0 ? (
                                                subCategoryListForNewItem.map((subCategory) => (
                                                <option key={subCategory._id} value={subCategory._id}>
                                                    {subCategory.name}
                                                </option>
                                                ))
                                            ) : (
                                                <option disabled>No subcategories found</option>
                                            )}
                                        </select>
                                    </div>
                                </div>
                                <div className='mb-4'>
                                    <h3 className='text-gray-600 font-semibold mb-2'>Description</h3>
                                    <textarea 
                                        name="" 
                                        id="" 
                                        rows={5}
                                        className='border-1 border-gray-300 rounded-lg w-full p-2'
                                        placeholder='Brief description...'
                                        onChange = {(e) => {setNewItemDescription(e.target.value)}}
                                        value={newItemDescription}
                                    >

                                    </textarea>
                                </div>
                                <Button type='submit' className='!w-full'>{editingItem?"Update Item":"Add Item to Menu"}</Button>
                            </form>
                        )}
                        {activeTab === "category" && (
                            <form onSubmit={editingCategory ? handleUpdateCategory :handleAddCategory}>
                                <h1 className='text-lg font-semibold py-2'>{editingCategory ?"Update Category":"New Category"}</h1>
                                <div className='mb-4'>
                                    <h3 className='text-gray-600 font-semibold mb-2'>Category Name</h3>
                                    <input 
                                        type="text" 
                                        placeholder='e.g., Grilled Salmon'
                                        className='border-1 border-gray-300 rounded-lg w-full p-2' 
                                        value={newCategory}
                                        onChange={(e)=> setNewCategory(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className='mb-4'>
                                    <h3 className='text-gray-600 font-semibold mb-2'>Description (Optional)</h3>
                                    <textarea 
                                        name="" 
                                        id="" 
                                        rows={5}
                                        className='border-1 border-gray-300 rounded-lg w-full p-2'
                                        placeholder='Brief description...'
                                        value={newCategoryDescription}
                                        onChange={(e)=> setNewCategoryDescription(e.target.value)}
                                    >

                                    </textarea>
                                </div>
                                <Button type='submit' className='!w-full'>{editingCategory ? "Update Category" :"Add Category to Menu"}</Button>
                            </form>
                        )}
                        {activeTab === "sub-category" && (
                            <form onSubmit={editingSubCategory? handleUpdateSubCategory:handleAddSubCategories}>
                                <h1 className='text-lg font-semibold py-2'>{editingSubCategory ? "Update Sub Category":"New Sub Category"}</h1>
                                <div className='mb-4'>
                                    <h3 className='text-gray-600 font-semibold mb-2'>Sub Category Name</h3>
                                    <input 
                                        type="text" 
                                        placeholder='e.g., Grilled Salmon'
                                        className='border-1 border-gray-300 rounded-lg w-full p-2' 
                                        onChange={(e) => setNewSubCategory(e.target.value)}
                                        value={newSubCategory}
                                        required
                                    />
                                </div>
                                <div className='mb-4'>
                                    <h3 className='text-gray-600 font-semibold mb-2'>Parent Category</h3>
                                    <select 
                                        className='border-1 border-gray-300 rounded-lg w-full p-2'
                                        value={newSubCategoryParent}
                                        onChange={(e)=> setNewSubCategoryParent(e.target.value)}
                                        required
                                    >
                                        {
                                            categories.map((category)=>(
                                                <option key={category._id} value={category._id}>{category.name}</option>
                                            ))
                                        }
                                    </select>
                                </div>
                                <div className='mb-4'>
                                    <h3 className='text-gray-600 font-semibold mb-2'>Description (Optional)</h3>
                                    <textarea 
                                        name="" 
                                        id="" 
                                        rows={5}
                                        className='border-1 border-gray-300 rounded-lg w-full p-2'
                                        placeholder='Brief description...'
                                        value={newSubCategoryDescription}
                                        onChange={(e) => setNewSubCategoryDescription(e.target.value)}
                                    >

                                    </textarea>
                                </div>
                                <Button type='submit' className='!w-full'>{editingSubCategory ? "Update Sub Category" : "Add Sub Category to Menu"}</Button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
            <div className="col-span-12 md:col-span-8">
                <div className="mx-auto px-4 py-3 border border-gray-300 bg-white rounded-2xl shadow-lg">
                    <div className=''>
                        {/* Category */}
                        <div className=''>
                            <div className='mt-3 mb-5'>
                                <h1 className='pb-4 text-xl font-bold border-b border-gray-300'>All  Items</h1>
                                <ul className='mt-4'>
                                    {
                                        categories?.map((category)=>(
                                            <div key={category._id}>
                                                <li
                                                    onClick={() => {
                                                        if (selectedCategoryListItem === category._id) { 
                                                            setSelectedCategoryListItem(null); 
                                                            setSubCategories([]); 
                                                            setItems([]); 
                                                        } else { 
                                                            setSelectedCategoryListItem(category._id); 
                                                            fetchSubCategories(category._id); 
                                                            setItems([]); 
                                                        }
                                                    }}
                                                    className={`flex items-center justify-between mb-2 p-3 rounded-lg cursor-pointer hover:bg-blue-600 hover:text-white 
                                                        ${selectedCategoryListItem === category._id ? "bg-blue-600 text-white" : "bg-white border border-gray-300 text-gray-700"}`}
                                                    >
                                                    <div className='flex items-center gap-1'>
                                                        <IoIosArrowForward size={20} className={`${selectedCategoryListItem === category._id && "rotate-90"} transition-all`}/>
                                                        {category.name}
                                                    </div>
                                                    <div className='flex items-center gap-1'>
                                                        <FaEdit size={20} className='cursor-pointer hover:text-green-300' onClick={()=> {
                                                            setEditingCategory(category);
                                                            setNewCategory(category.name);
                                                            setNewCategoryDescription(category.description || "");
                                                            setActiveTab("category")}}
                                                        />
                                                        <MdDelete size={20} className='cursor-pointer hover:text-red-600' onClick={() =>handleDeleteCategory(category._id)} />
                                                    </div>
                                                </li>
                                                 {selectedCategoryListItem === category._id && (
                                                <ul className="relative before:absolute before:left-1 before:top-0 before:h-full before:border-l-1 before:border-gray-300">
                                                    {subCategoryLoading ? (
                                                        <div className='flex justify-center'>
                                                            <img src={preloader} className='w-15' alt="loading" />
                                                        </div>
                                                    ):(
                                                    subCategories.length > 0 ?(
                                                        subCategories.map((subCategory)=>(
                                                            <div key={subCategory._id} >
                                                                <li 
                                                                    onClick={() => {
                                                                        if (selectedSubCategoryListItem === subCategory._id) {
                                                                            setSelectedSubCategoryListItem(null);
                                                                        }else{
                                                                            setSelectedSubCategoryListItem(subCategory._id);
                                                                            fetchItems(subCategory._id);
                                                                        }
                                                                    }}
                                                                    className={`ms-4 flex items-center justify-between mb-2 p-3 rounded-lg cursor-pointer hover:bg-blue-600 hover:text-white 
                                                                            ${selectedSubCategoryListItem === subCategory._id ? "bg-blue-600 text-white" : "bg-white border border-gray-300 text-gray-700"}`}
                                                                    >
                                                                    <div className='flex items-center gap-1'>
                                                                        <IoIosArrowForward size={20} className={`${selectedSubCategoryListItem === subCategory._id && "rotate-90"} transition-all`}/>
                                                                        {subCategory.name}
                                                                    </div>
                                                                    <div className='flex items-center gap-1'>
                                                                        <FaEdit size={20} className='cursor-pointer hover:text-green-300' onClick={()=>{
                                                                            setEditingSubCategory(subCategory);
                                                                            setActiveTab("sub-category");
                                                                            setNewSubCategory(subCategory.name);
                                                                            setNewSubCategoryDescription(subCategory.description);
                                                                            setNewSubCategoryParent(subCategory.category)
                                                                        }}/>
                                                                        <MdDelete className='cursor-pointer hover:text-red-600' size={20} onClick={()=> handleDeleteSubCategory(subCategory._id)} />
                                                                    </div>
                                                                </li>
                                                                 {selectedSubCategoryListItem === subCategory._id && (
                                                                <ul className="relative before:absolute before:left-5 before:top-0 before:h-full before:border-l-1 before:border-gray-300">
                                                                    {
                                                                        itemsLoading ? (
                                                                            <div className='flex justify-center'>
                                                                                <img src={preloader} className='w-15' alt="loading" />
                                                                            </div>
                                                                        ):(
                                                                        items.items?.length > 0 ?(
                                                                            items.items?.map((item)=>(
                                                                                <li 
                                                                                    key={item._id}
                                                                                    className={`ms-8 flex items-center justify-between mb-2 p-3 rounded-lg bg-white border border-gray-300 text-gray-700`}
                                                                                    >
                                                                                    <div className='flex items-center gap-5'>
                                                                                        <img 
                                                                                            src={`${API_URL}uploads/pos-items/${item.image}`}
                                                                                            className='h-12 object-cover'
                                                                                        />
                                                                                        <div>
                                                                                            <h1>Name: <b>{item.name}</b></h1>
                                                                                            <p>Price: <b>Rs.{item.price}</b></p>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className='flex items-center gap-1'>
                                                                                        <FaEdit size={20} className='cursor-pointer hover:text-green-300' onClick={()=>{
                                                                                                setEditingItem(item);
                                                                                                setActiveTab("add-item");
                                                                                                setNewItem(item.name);
                                                                                                setNewItemPrice(item.price);
                                                                                                setNewItemDescription(item.description);
                                                                                                setNewItemParentCategory(item.subcategory.category._id);
                                                                                                setNewItemSubCategory(item.subcategory._id)
                                                                                                if (item.image) { 
                                                                                                    setPreviewUrl(`${API_URL}uploads/pos-items/${item.image}`); 
                                                                                                    setNewItemImage(null); 
                                                                                                }
                                                                                            }
                                                                                        }/>
                                                                                        <MdDelete size={20} className='cursor-pointer hover:text-red-600' onClick={()=> handleDeleteItem(item._id)}/>
                                                                                    </div>
                                                                                </li>
                                                                            ))   
                                                                        ):(
                                                                            <p className='ms-8 text-sm text-gray-500'>No  items found.</p>
                                                                        )
                                                                    )}
                                                                </ul>
                                                                 )}
                                                            </div>
                                                        ))
                                                    ):(
                                                        <p className='text-sm text-gray-500 ms-4'>No sub categories found.</p>
                                                    )
                                                )
                                                }
                                                </ul>
                                                 )}
                                            </div>
                                        ))
                                    }
                                </ul>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    </div>
  </>
  )
}

export default POSCatalog