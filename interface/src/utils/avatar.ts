// src/utils/avatar.ts


export const getAvatar = (match: any) => {
    let path =
      match.avatar ||
      (match.media?.length ? match.media[match.media.length - 1].file_path : null);
  
    if (!path) return "/images/default-avatar.png";
  
    // Fix relative → absolute
    if (!path.startsWith("http")) {
      path = `http://127.0.0.1:8000/${path}`;
    }
  
    return path;
  };
  