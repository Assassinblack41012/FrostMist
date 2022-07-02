import React, {useEffect, useRef, useState} from "react";
import moment from "moment";
import ReactLoading from "react-loading";
import useKeypress from "react-use-keypress";
//component
import ReplyComment from "./ReplyComment";
//icon
import {AiOutlineCamera, AiOutlineSend, AiFillHeart} from "react-icons/ai";
import {TiTick} from "react-icons/ti";
import {MdCancel} from "react-icons/md";
import {toast} from "react-toastify";

const Comment = ({
    currentComment,
    userId,
    deleteComment,
    autoFetch,
    postId,
    navigate,
    user_img,
}) => {
    const [showOption, setShowOption] = useState(false);
    const [editComment, setEditComment] = useState(false);
    const [comment, setComment] = useState(currentComment);
    const [text, setText] = useState(currentComment.text);
    const [editLoading, setEditLoading] = useState(false);
    const [likeCommentLoading, setLikeCommentLoading] = useState(false);
    const [imageEdit, setImageEdit] = useState(currentComment.image || null);
    const [formData, setFormData] = useState(null);

    const [textReply, setTextReply] = useState("");
    const [replyLoading, setReplyLoading] = useState(false);
    const [replyImage, setReplyImage] = useState(null);
    const [openFormReply, setOpenFormReply] = useState(false);
    const [showReply, setShowReply] = useState(false);

    const cmtHistory = useRef(currentComment.text);

    const cancelEdit = () => {
        setEditComment(false);
        setShowOption(false);
        setText(cmtHistory.current);
        setImageEdit(currentComment.image);
    };

    const handleImage = (e) => {
        const file = e.target.files[0];
        setImageEdit({url: URL.createObjectURL(file)});

        let formData = new FormData();
        formData.append("image", file);
        // @ts-ignore
        setFormData(formData);
    };

    const uploadOtherImage = async () => {
        try {
            const {data} = await autoFetch.post(
                `/api/post/upload-image`,
                formData
            );
            return {url: data.url, public_id: data.public_id};
        } catch (error) {
            toast.error("Upload image fail!");
            return null;
        }
    };

    useKeypress("Escape", cancelEdit);

    const handleComment = async (text) => {
        setEditLoading(true);
        try {
            let image = imageEdit;
            if (imageEdit) {
                if (imageEdit.url !== comment.image?.url) {
                    image = await uploadOtherImage();
                    // when upload false
                    if (!image) {
                        setEditLoading(false);
                        setImageEdit(comment.image);
                        return;
                    }
                }
            }
            await autoFetch.patch(`/api/post/edit-comment`, {
                postId,
                text,
                commentId: comment._id,
                image,
            });
            setEditComment(false);
            cmtHistory.current = text;
        } catch (error) {
            console.log(error);
        }
        setEditLoading(false);
    };

    const likeComment = async () => {
        setLikeCommentLoading(true);
        try {
            const {data} = await autoFetch.put(`/api/post/like-comment`, {
                postId,
                commentId: comment._id,
            });
            setComment({...comment, like: data.comment.like});
        } catch (error) {
            console.log(error);
        }
        setLikeCommentLoading(false);
    };

    const unlikeComment = async () => {
        setLikeCommentLoading(true);
        try {
            const {data} = await autoFetch.put(`/api/post/unlike-comment`, {
                postId,
                commentId: comment._id,
            });
            setComment({...comment, like: data.comment.like});
        } catch (error) {
            console.log(error);
        }
        setLikeCommentLoading(false);
    };

    const handleLikeComment = () => {
        if (comment.like.includes(userId)) {
            unlikeComment();
        } else {
            likeComment();
        }
    };

    const toggleEdit = () => {
        setEditComment(!editComment);
    };

    const handleDeleteComment = () => {
        if (window.confirm("Do u want delete this comment?")) {
            deleteComment(comment._id);
        }
    };

    const cancelReply = () => {
        setOpenFormReply(false);
    };

    useEffect(() => {
        setOpenFormReply(showReply);
    }, [showReply]);

    // add image in reply
    const changeImageReply = (e) => {
        const file = e.target.files[0];
        // @ts-ignore
        setReplyImage({url: URL.createObjectURL(file)});

        let formData = new FormData();
        formData.append("image", file);
        // @ts-ignore
        setFormData(formData);
    };

    const handleAddReply = async () => {
        try {
            if (!textReply) {
                return;
            }
            setReplyLoading(true);
            try {
                let image;
                if (replyImage) {
                    image = await uploadOtherImage();
                    if (!image) {
                        setReplyLoading(false);
                        setReplyImage(null);
                        return;
                    }
                }
                const {data} = await autoFetch.put(
                    "/api/post/add-reply-comment",
                    {
                        postId,
                        commentId: comment._id,
                        text: textReply,
                        image,
                    }
                );
                setComment({...comment, reply: data.comment.reply});
                setReplyImage(null);
            } catch (error) {
                console.log(error);
            }
            setReplyLoading(false);
            setTextReply("");
        } catch (error) {}
    };

    const handleDeleteReplyComment = async (replyId) => {
        if (!window.confirm("Do u want delete this reply comment?")) {
            return;
        }
        try {
            const {data} = await autoFetch.put(
                `/api/post/delete-reply-comment`,
                {
                    postId,
                    commentId: currentComment._id,
                    replyId,
                }
            );
            setComment({...comment, reply: data.reply});
            toast("You have deleted reply comment!");
        } catch (error) {
            console.log(error);
        }
    };

    // Edit mode
    if (editComment) {
        return (
            <div className='flex gap-x-1.5 py-1 '>
                <img
                    src={comment.postedBy.image?.url}
                    alt='user_avatar'
                    className='w-[35px] h-[35px] object-cover shrink-0 rounded-full mt-1  '
                />
                <div className='w-full'>
                    <form
                        className='flex px-2 rounded-full bg-[#F0F2F5] w-full mt-1 items-center dark:bg-[#3A3B3C]  '
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (text) {
                                handleComment(text);
                            }
                        }}>
                        <input
                            type='text'
                            className='px-2 py-1.5 border-none focus:ring-0 bg-inherit rounded-full w-full font-medium dark:placeholder:text-[#b0b3b8] '
                            placeholder='Write a comment...'
                            value={text}
                            disabled={editLoading}
                            onChange={(e) => {
                                setText(e.target.value);
                            }}
                        />
                        {!editLoading && (
                            <label>
                                <AiOutlineCamera className='shrink-0 text-[18px] transition-50 mr-2 opacity-60 hover:opacity-100 dark:text-[#b0b3b8] cursor-pointer ' />
                                <input
                                    onChange={handleImage}
                                    type='file'
                                    accept='image/*'
                                    name='avatar'
                                    hidden
                                />
                            </label>
                        )}
                        <button type='submit' disabled={editLoading || !text}>
                            {editLoading ? (
                                <ReactLoading
                                    type='spin'
                                    width={20}
                                    height={20}
                                    color='#7d838c'
                                />
                            ) : (
                                <AiOutlineSend className='shrink-0 text-xl transition-50 hover:scale-125 dark:text-[#b0b3b8] ' />
                            )}
                        </button>
                    </form>
                    {imageEdit && (
                        <div className='relative w-max '>
                            <img
                                src={imageEdit?.url}
                                alt='image_comment'
                                className='max-h-52 w-auto object-contain my-1 ml-3 '
                            />
                            {!editLoading && (
                                <MdCancel
                                    className='absolute top-1 right-1 text-2xl transition-50 cursor-pointer '
                                    onClick={() => {
                                        setImageEdit(null);
                                    }}
                                />
                            )}
                        </div>
                    )}
                    <p className='text-[12px] dark:text-[#b0b3b8] ml-3 '>
                        Press Esc to{" "}
                        <span
                            className='text-[#ab2b3a] cursor-pointer '
                            onClick={cancelEdit}>
                            cancel
                        </span>
                        .
                    </p>
                </div>
            </div>
        );
    }

    // reply mode
    const ReplyMode = () => {
        return (
            <div>
                <div
                    className={`flex font-extrabold text-[13px] pl-2 gap-x-4 text-[#65676B] dark:text-[#b0b3b8] `}>
                    <button
                        className={`cursor-pointer ${
                            comment.like.length > 0 &&
                            comment.like.includes(userId) &&
                            "text-[#c22727] dark:text-[#c22727]"
                        } `}
                        disabled={likeCommentLoading}
                        onClick={handleLikeComment}>
                        Like
                    </button>
                    <button
                        className='cursor-pointer'
                        onClick={() => {
                            setOpenFormReply(true);
                            setShowReply(true);
                        }}>
                        Reply
                    </button>
                    {comment.reply.length > 0 && (
                        <button
                            className='cursor-pointer'
                            onClick={() => {
                                setShowReply(!showReply);
                            }}>
                            {showReply
                                ? "Hide  "
                                : `View more ${comment.reply.length}
                    ${comment.reply.length > 1 ? " replies" : " reply"} `}
                        </button>
                    )}

                    <div className='font-normal '>
                        {moment(comment.created).fromNow()}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={`relative mt-4 `}>
            {showReply && comment.reply.length > 0 && (
                <div className='absolute h-[80%] w-0.5 left-5 bg-[#F0F2F5] dark:bg-[#3A3B3C] '></div>
            )}
            {/* comment main */}
            <div className=' flex gap-x-1.5 mt-1.5 group'>
                {/* avatar of own's comment */}
                <img
                    src={comment.postedBy.image?.url}
                    alt='own_avt_cmt'
                    className='w-10 h-10 object-cover rounded-full cursor-pointer z-10 '
                    onClick={() => {
                        navigate(`/profile/${comment.postedBy._id}`);
                    }}
                />
                <div
                    className={`box-comment relative w-full ${
                        editLoading && "opacity-50"
                    } `}>
                    <div className='flex items-center gap-x-1 w-full '>
                        <div className='rounded-xl bg-[#F0F2F5] dark:bg-[#3A3B3C] px-3 py-2 max-w-full relative  '>
                            <div
                                className='font-bold text-[13px] text-[#050505] dark:text-[#e4e6eb] flex items-center gap-x-1 cursor-pointer '
                                onClick={() => {
                                    navigate(
                                        `/profile/${comment.postedBy._id}`
                                    );
                                }}>
                                {comment.postedBy.name}
                                {comment.postedBy.role === "Admin" && (
                                    <TiTick className='text-[13px] text-white rounded-full bg-sky-500 ' />
                                )}
                            </div>
                            <div
                                className={`content text-[15px] text-[#050505] dark:text-[#cecfd1] `}>
                                {text}
                            </div>
                            {imageEdit && (
                                <img
                                    src={imageEdit?.url}
                                    alt='image_comment'
                                    className='max-h-60 w-auto object-contain my-0.5 '
                                />
                            )}

                            {/* edit or delete comment */}
                            {userId === comment.postedBy._id && (
                                <div
                                    className='shrink-1 w-10 h-10 hidden group-hover:flex cursor-pointer text-[23px] font-extrabold hover:bg-[#F0F2F5] items-center justify-center rounded-full transition-50 dark:hover:bg-[#3A3B3C] absolute z-[100]  right-[-45px] top-[50%] translate-y-[-50%] '
                                    onClick={() => {
                                        setShowOption(!showOption);
                                    }}>
                                    <div className='translate-y-[-6px] '>
                                        ...
                                    </div>
                                    <ul
                                        className={`text-base absolute top-[110%] text-center ${
                                            !showOption
                                                ? "hidden"
                                                : "flex flex-col"
                                        }`}
                                        onMouseLeave={() => {
                                            setShowOption(false);
                                        }}>
                                        <li
                                            className='px-3 py-1 bg-[#F0F2F5] border-[#3A3B3C]/40 text-[#333]/60 hover:border-[#3A3B3C]/60 hover:text-[#333]/80 dark:bg-[#3A3B3C] rounded-md border dark:text-[#e4e6eb]/60 transition-50 dark:hover:text-[#e4e6eb] dark:border-[#3A3B3C] dark:hover:border-[#e4e6eb]/60 '
                                            onClick={toggleEdit}>
                                            Edit
                                        </li>
                                        <li
                                            className='mt-1 px-3 py-1 bg-[#F0F2F5] border-[#3A3B3C]/40 text-[#333]/60 hover:border-[#3A3B3C]/60 hover:text-[#333]/80 dark:bg-[#3A3B3C] rounded-md border dark:text-[#e4e6eb]/60 transition-50 dark:hover:text-[#e4e6eb] dark:border-[#3A3B3C] dark:hover:border-[#e4e6eb]/60'
                                            onClick={handleDeleteComment}>
                                            Delete
                                        </li>
                                    </ul>
                                </div>
                            )}
                            {comment.like.length > 0 && (
                                <div
                                    className={`absolute bottom-2 bg-inherit p-1 ${
                                        comment.like && comment.like.length > 1
                                            ? "px-2 right-[-30px]"
                                            : "right-[-20px]"
                                    } rounded-full flex items-center gap-x-0.5 border-[1px] border-black/10 dark:border-white/10 text-[13px] `}>
                                    <AiFillHeart className='text-[14px] text-[#c22727] dark:text-[#c22727]' />
                                    {comment.like.length > 1
                                        ? comment.like.length
                                        : ""}
                                </div>
                            )}
                        </div>
                    </div>
                    {ReplyMode()}
                </div>
            </div>
            {/* Reply comment */}
            <div className='w-full pl-5 '>
                {showReply &&
                    comment.reply.length > 0 &&
                    comment.reply.map((cmt) => (
                        <ReplyComment
                            key={cmt._id}
                            currentComment={cmt}
                            navigate={navigate}
                            userId={userId}
                            autoFetch={autoFetch}
                            commentId={comment._id}
                            postId={postId}
                            handleDeleteReplyComment={handleDeleteReplyComment}
                        />
                    ))}
            </div>
            {/* form add reply comment */}
            {openFormReply && (
                <>
                    <div className='flex gap-x-1.5 px-[10%] pt-2 w-full relative items-center '>
                        <img
                            src={user_img}
                            alt='user_avatar'
                            className='w-8 h-8 object-cover shrink-0 rounded-full '
                        />
                        <form
                            className='flex px-2 rounded-full bg-[#F0F2F5] w-full mt-1 items-center dark:bg-[#3A3B3C]  '
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleAddReply();
                            }}>
                            <input
                                type='text'
                                className='px-1.5 py-1 border-none focus:ring-0 bg-inherit rounded-full w-full font-medium dark:placeholder:text-[#b0b3b8] text-[15px] '
                                placeholder={`Reply to "${comment.postedBy.name}"... `}
                                value={textReply}
                                disabled={replyLoading}
                                autoFocus={true}
                                onChange={(e) => {
                                    setTextReply(e.target.value);
                                }}
                            />
                            {!replyLoading && (
                                <label>
                                    <AiOutlineCamera className='shrink-0 text-[18px] transition-50 mr-2 opacity-60 hover:opacity-100 dark:text-[#b0b3b8] cursor-pointer ' />
                                    <input
                                        onChange={changeImageReply}
                                        type='file'
                                        accept='image/*'
                                        name='avatar'
                                        hidden
                                    />
                                </label>
                            )}
                            <button
                                type='submit'
                                disabled={replyLoading || !textReply}>
                                {replyLoading ? (
                                    <ReactLoading
                                        type='spin'
                                        width={20}
                                        height={20}
                                        color='#7d838c'
                                    />
                                ) : (
                                    <AiOutlineSend className='shrink-0 text-xl transition-50 hover:scale-125 dark:text-[#b0b3b8] ' />
                                )}
                            </button>
                        </form>
                    </div>

                    {replyImage && (
                        <div className='w-full pl-[16%] '>
                            <div className='relative group w-max '>
                                <img
                                    // @ts-ignore
                                    src={replyImage.url}
                                    alt='reply_image'
                                    className='max-h-20 w-auto object-contain  mt-2 '
                                />
                                {!replyLoading && (
                                    <MdCancel
                                        className='absolute top-1 right-1 text-2xl transition-50 cursor-pointer hidden group-hover:flex '
                                        onClick={() => {
                                            setReplyImage(null);
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    )}
                    {!replyLoading && (
                        <button
                            className='text-red-500 ml-[16%] text-[12px] '
                            onClick={cancelReply}>
                            Cancel reply
                        </button>
                    )}
                </>
            )}
        </div>
    );
};

export default Comment;
