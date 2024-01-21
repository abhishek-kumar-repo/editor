import { useParams } from "next/navigation";
import { GoDotFill } from "react-icons/go";
import { IoTriangle } from "react-icons/io5";
import useRender from "./useRender";
import { createRef, useEffect, useRef, useState } from "react";
const EditorId = ({ pageId }) => {
  const {
    outline,
    setOutline,
    editorRef,
    nodeRef,
    handleAddChildNode,
    addNewNode,
    handleContentChange,
    handleChildRender,
    router,
  } = useRender();
  const params = useParams();

  const [selectedNode, setSelectedNode] = useState([]);

  useEffect(() => {
    setSelectedNode(findChildrenById(outline, pageId));
  }, [params, outline]);

  const findChildrenById = (data, targetId) => {
    let result = [];

    const findNode = (items) => {
      for (const item of items) {
        if (item.id === targetId) {
          result = [item] || [];
          return;
        }

        if (item.children && item.children.length > 0) {
          findNode(item.children);
        }
      }
    };

    findNode(data);
    return result;
  };


  // Render child nodes
  const renderOutline = (items, parentId = null) => {
    return (
      <ul key={parentId}>
        {items?.map((item) => {
          const { id, children, state, text } = item;
          // const divRef = getOrCreateRef(id); 
          return (
            <li key={id} data-id={id} ref={nodeRef}>
              <div className="flex flex-row items-center text-gray-700 py-1 text-lg relative">
                {children.length > 0 && (
                  <IoTriangle
                    className={` absolute ml-[-10px] w-3 h-3 mt-1 text-gray-800 cursor-pointer transform transition-transform duration-200 ${
                      state ? "rotate-180" : "rotate-90"
                    }`}
                    onClick={() => handleChildRender(id)}
                  />
                )}
                <button
                  className="hover:border-1 hover:border-gray-300 hover:rounded-full hover:bg-gray-300 w-4 h-4  mr-1"
                  onClick={() => {
                    handleAddChildNode(item);
                    findChildrenById(items, item.id);
                  }}
                >
                  <GoDotFill />
                </button>
                {/**focus-visible:outline-none */}
                <div
                  id={id}
                  // ref={divRef}
                  ref={nodeRef}
                  className="w-[41rem] focus-visible:outline-none"
                  contentEditable={true}
                  suppressContentEditableWarning={true}
                >
                  {text}
                </div>
              </div>
              {state && (
                <div className="ml-5">{renderOutline(children, id)}</div>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="">
      <div className="flex flex-row justify-around items-center">
        <div
          className=" cursor-pointer border-2 rounded-full border-gray-500 px-2 py-1"
          onClick={() => router.back()}
        >
          Back
        </div>
        <div>Editor</div>
        <div
          onClick={() => {
            localStorage.removeItem("outline");
            setOutline([
              { id: "1", text: `\u00A0`, children: [], state: false, level: 1 },
            ]);
          }}
          className=" cursor-pointer border-2 rounded-full border-gray-500 px-2 py-1"
        >
          Clear
        </div>
      </div>
      <div
        className="border rounded-md min-h-screen px-36 py-4"
        onKeyDown={addNewNode}
        ref={editorRef}
        onInput={handleContentChange}
      >
        {renderOutline(selectedNode.length == 0 ? outline : selectedNode)}
      </div>
    </div>
  );
};
export default EditorId;

EditorId.getInitialProps = async ({ query }) => {
  const { id } = query;
  return {
    pageId: id,
  };
};
