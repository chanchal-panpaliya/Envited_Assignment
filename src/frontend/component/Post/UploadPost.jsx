import { useState , useRef ,useEffect , useContext} from 'react';
//img
import photo from '../../img/images/photo.png';
import feeling from '../../img/images/feeling.png';
//redux
import {addUserPost,getAllPosts} from '../../redux/action/postSlice';
import {getAllUser} from '../../redux/action/userSlice';
import { useSelector ,useDispatch } from "react-redux";
//component
import {PreviewPostModal} from "../Modal/Modal";
//context
import SocialContext from '../../reducer/SocialContext';
//constant
import {postLimit,Hashtag,emojis} from '../../constant/post';


const UploadPost = ({modalClose}) =>{
    //context
    let {toastdispatch} = useContext(SocialContext)
    //redux
    const dispatch = useDispatch();
    const { token , user } = useSelector((store) => store.authentication);
    const { allUsers ,following} = useSelector((store) => store.Users);
    const { allPosts } = useSelector((store) => store.Post);
    //ref
    const hashtagref = useRef();    
    //local state
    const [UserList,SetUserList] = useState(false)
    const [NameListArray,setNameListArray] = useState([])
    const [url,seturl] = useState("")
    const [Postcontent,setPostContent] = useState("")
    const [title,settitle] = useState("")
    const [gethashtag,sethashtag] = useState("")
    const [postType,setType]=useState("POST")
    const [postPolicy,setPolicy]=useState("public")
    const [eventLocation,setEventLocation]=useState("");
    const [eventDate,setDate]=useState("");
    const [postTopic,SetpostTopic]=useState("")
    const [checklist , setChecklist ] = useState([])
    //
    const [hashtaglist,sethashtaglist] = useState(Hashtag)
    const [emojilist,setemoji_list] = useState(emojis)
    //
    const [isPreview,setPreview]=useState(false)
    const [previewData,setpreviewData]=useState("")
   //load first time
    useEffect(()=>{
        dispatch(getAllUser())
        const data = allUsers.map((item)=>{
            return{
                id:item._id,
                display:item.username
            }
        })
        SetUserList(data)
        dispatch(getAllPosts()).then((res)=>{
            let getpostdata = res.payload.posts
            let unique_list = getpostdata.length>0 && [...new Set(getpostdata.map(q => q.postTopic))];
            let updated_list = unique_list.length>0 && unique_list.filter((item)=>item!=="")
             if(unique_list[0]!==""){
               setChecklist(updated_list) 
             }
         })         
    },[])
    //
    useEffect(()=>{
        let time4 = setTimeout(() => {
            matchHashTags()
        }, 0);
       return () => clearTimeout(time4)
    },[Postcontent])

    //tagName
    const handleSelectTagName=(name)=>{
        if(NameListArray.length>0){
            let check = NameListArray.find(item=>item.id==name.id)
            if(check){
                toastdispatch({type:'WARNING',payload:"Already Tag"})
            }else{
                setNameListArray((prv)=>[...prv,name])
            }
        }else{
            setNameListArray((prv)=>[...prv,name])
        }
        
    }

    //Hashtag
    const handleHashTagName=(name)=>{
        setPostContent((prev) => prev.length < postLimit ? prev + name : prev)
    }

    const handleContentChange=(e)=>{
        setPostContent(e.target.value);
    }

    const matchHashTags=()=>{
        let string = Postcontent;
        let regex = /#(\w*[0-9a-zA-Z]+\w*[0-9a-zA-Z])/gi;
        let matches = string.matchAll(regex);
        let data =[]
        for (let match of matches){  
             data = data + match[0]
        }
        let ok = []
        if(data.length>0){
           ok =  data.split('#').filter(item=>item!="")
        }
        
        sethashtag((prev)=>[...new Set(ok)]) 
    }
   
   //imageupload
    const handleFile = async (e) =>{
        e.preventDefault();
        if(e.target.files[0].length !== 0){
            const profileImageFormData = new FormData();
            profileImageFormData.append("file", e.target.files[0]);
            profileImageFormData.append("upload_preset", "gdnzjijb");
            profileImageFormData.append("cloud_name", "chanchal12");             
            await fetch('https://api.cloudinary.com/v1_1/chanchal12/image/upload', {
              method: "POST",
              body: profileImageFormData,
            }).then((res) => res.json())
              .then((data) => {
                seturl(data.url)
                toastdispatch({type:'SUCCESS',payload:"Image uploaded on server"})
              }).catch((err) => {
                toastdispatch({type:'DANGER',payload:"ERROR!! Can't Image upload on server"})
              });
        }
    }


    const handleEmojiClick = (emoji) => {
        setPostContent((prev) => (prev.length < 150 ? prev + emoji : prev));
      };

    const CompaireDate=(e)=>{
        let ToDate = new Date();
        if (new Date(e.target.value).getTime() <= ToDate.getTime()) {
            toastdispatch({type:'WARNING',payload:"The Date must be bigger then today's date"})
        }else{
            setDate(e.target.value)
        }
    }  

    const PreviewPost=()=>{
        let data={
            url :url,
            content : Postcontent,
            title : title,
            tagName : NameListArray,
            gethashtag : gethashtag,
            postType:postType,
            postPolicy : postPolicy,
            eventLocation : eventLocation,
            eventDate : eventDate
        }
        //  console.log(data)
        setpreviewData(data)
        setPreview(!isPreview)        
    }

    const UploadPost=()=>{
        if(postType==="EVENT"){
            if(title!=="" && Postcontent!=="" && eventLocation!=="" && eventDate!=="" && postTopic!==""){
                let postData = {
                    title:title,
                    url:url,
                    content:Postcontent,
                    tagName : NameListArray,
                    gethashtag : gethashtag,
                    postType:postType,
                    postTopic:postTopic,
                    postPolicy : postPolicy,
                    eventLocation : postType==="EVENT"? eventLocation:"",
                    eventDate : postType==="EVENT"?eventDate:"",
                  }
                  dispatch(addUserPost({postData,token,user,dispatch,toastdispatch}))
                  modalClose()
            }else{
                toastdispatch({type:'WARNING',payload:"title , content , post topic , event location and date is empty"})
            }    
        }

        if(postType==="POST"){
            if(title!=="" && Postcontent!=="" && postTopic!==""){
                let postData = {
                    title:title,
                    url:url,
                    content:Postcontent,
                    tagName : NameListArray,
                    gethashtag : gethashtag,
                    postType:postType,
                    postTopic:postTopic,
                    postPolicy : postPolicy,
                    eventLocation : postType==="EVENT"? eventLocation:"",
                    eventDate : postType==="EVENT"?eventDate:"",
                  }
                  dispatch(addUserPost({postData,token,user,dispatch,toastdispatch}))
                  modalClose()
            }else{
                toastdispatch({type:'WARNING',payload:"title , post topic and content is empty"})
            }
        }

    }

  

 return(
    <div className='write-post-container'>
        <h3> Create Post </h3>
        <div className='post-type'>
             <button className={postType==="POST"?"active-post-type":""} onClick={()=>setType("POST")}> POST </button> 
             <button className={postType==="EVENT"?"active-post-type":""} onClick={()=>setType("EVENT")}> EVENT </button>
        </div>
        <div className='post-button-container'>
        <div className='add-post-links'>
            {/* /emoji/ */}
            <div className='header-more-container'>  
                <button> <img src={feeling} alt="post-links"/> Feeling/Activity  </button> 
                <div className="dropdown-more-content dropdown-margin">
                    <ul className='user-list-scroll-emoji'> 
                        {
                            emojilist.length>0 && emojilist.map((item)=><li className='user-list-name' onClick={()=>{handleEmojiClick(item)}}>{item}</li>)
                        }
                    </ul>
                </div>
            </div>
            {/* /hashtag/ */}
            <div className='header-more-container'> 
                <button> <i class="fa-solid fa-hashtag"></i> Hashtag  </button>
                <div className="dropdown-more-content dropdown-margin">
                    <ul className='user-list-scroll'> 
                        {
                            hashtaglist.length>0 && hashtaglist.map((item,index)=><li className='user-list-name' onClick={()=>{handleHashTagName(item)}}>{item}</li>)
                        }
                    </ul>
                </div>
            </div>
            {/* /persontag/ */}
            <div className='header-more-container'>
                <button> <i class="fa-solid fa-at"></i> Tag people  </button>
                <div className="dropdown-more-content dropdown-margin">
                    <ul className='user-list-scroll'>
                        {
                            UserList.length>0 && UserList.map((item)=><li className='user-list-name' onClick={()=>{handleSelectTagName(item)}}>{`@${item.display}`}</li>)
                        }
                    </ul>
                </div>
            </div>
        </div>
        <button className='post-button' onClick={()=>UploadPost()}> Upload Post </button>
       </div>
       <div className='post-row'> 
            <div className='user-profile'>
                <img src={user.profileImage} alt="profile1"/>
                <div className='write-post-username'>
                    <p> { user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1)}   {user.lastName.charAt(0).toUpperCase() + user.lastName.slice(1)} </p>
                    <small> 
                        <select value={postPolicy} onChange={(e)=>setPolicy(e.target.value)}> 
                            <option value="public"> public </option>
                            <option value="private"> private </option>
                        </select> 
                    </small>
                </div>
            </div>
            <div>
                <small> Post Topic: </small>
                <select value={postTopic} onChange={(e)=>SetpostTopic(e.target.value)}> 
                    {
                        checklist.length>0 && checklist.map((topic,I_topic)=>{
                            return  <option key={I_topic} value={topic}> {topic} </option>
                        })
                    }
                </select>
            </div>
        </div>
        <div className='post-input-conatiner'>
            <input type="text" placeholder='Title of post...' value={title} onChange={(e)=>settitle(e.target.value)}/>
            <textarea ref={hashtagref} autoFocus  rows="10" cols="30" maxLength={postLimit} 
                placeholder={`Whats on your mind ${user.firstName}`} value={Postcontent} onChange={handleContentChange} 
            />
            {Postcontent.trim().length} / {postLimit}
            {
                postType === "EVENT"? <>
                <div className='event-post'>
                    <div>
                            <label> Location  </label>
                            <input type="text" value={eventLocation} onChange={(e)=>setEventLocation(e.target.value)} placeholder='HolidayIn , Baner , Pune '/>
                    </div>
                    <div>
                            <label> Event Date:  </label>
                            <input type="date" value={eventDate} onChange={(e)=>CompaireDate(e)} placeholder='date...'/>
                    </div>
                </div>
                </> 
            : null
            }
            <div className='write-post-photos'>
                <img src={photo} alt="post-links"/>
                <input type="file"accept="image/*" placeholder='image link ...' onChange={(e)=>handleFile(e)}/>
            </div>
            <div className='write-post-photos'>
                <i class="fa-solid fa-at"></i>   
                    <div>
                        {NameListArray.length>0?NameListArray.map((item,index)=>{
                            return(
                                  <div> {item.display} <button className='remove-tag' onClick={()=>{setNameListArray(NameListArray.filter((_d,_di)=>_di!==index))}}> <i class="fa-solid fa-xmark"></i> </button> </div> 
                            )}) : <small> No tag list </small>
                        }
                    </div>
            </div>
        </div>
        <div className='preview'>
            <button className='login-button' onClick={()=>PreviewPost()}> Preview </button>
        </div>
         {isPreview? <PreviewPostModal page="profile" data={previewData}  modalClose={()=>setPreview(false)}/>:null}
    </div>
 )   
}

export default UploadPost