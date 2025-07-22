import React, { useRef, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const RichTextEditor = ({ value, onChange, error }) => {
  const quillRef = useRef(null);

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': '1'}, { 'header': '2'}, { 'font': [] }],
        [{ size: [] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }, 
         { 'indent': '-1'}, { 'indent': '+1' }],
        ['link', 'image', 'video'],
        [{ 'align': [] }],
        [{ 'color': [] }, { 'background': [] }],
        ['code-block'],
        ['clean']
      ],
      handlers: {
        image: function() {
          const input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'image/*');
          input.click();

          input.onchange = async () => {
            const file = input.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = () => {
                const quill = quillRef.current.getEditor();
                const range = quill.getSelection();
                quill.insertEmbed(range.index, 'image', reader.result);
              };
              reader.readAsDataURL(file);
            }
          };
        }
      }
    },
    clipboard: {
      matchVisual: false,
    }
  }), []);

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'align', 'color', 'background',
    'code-block'
  ];

  return (
    <div className="w-full">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder="Start writing your article content..."
        style={{
          height: '400px',
          marginBottom: '50px'
        }}
        className={error ? 'border-red-500' : ''}
      />
    </div>
  );
};

export default RichTextEditor;