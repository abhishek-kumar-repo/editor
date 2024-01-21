import { useParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
const useRender = () => {
  const router = useRouter();
  const params = useParams();

  const [outline, setOutline] = useState([
    { id: "1", text: `\u00A0`, children: [], state: false, level: 1 },
  ]);

  const editorRef = useRef(null);
  const nodeRef = useRef(null);

  useEffect(() => {
    try {
      const storedOutline = JSON.parse(localStorage.getItem("outline"));
      if (storedOutline) {
        setOutline(storedOutline);
      }
    } catch (error) {
      console.error(
        "Error parsing or retrieving data from localStorage:",
        error
      );
    }
  }, []);

  useEffect(() => {
    try {
      outline.length > 1 &&
        localStorage.setItem("outline", JSON.stringify(outline));
    } catch (error) {
      console.error("Error storing data to localStorage:", error);
    }
  }, [outline]);

  const generateRandomAlphanumericId = (length) => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }

    return result;
  };

  // Add Child node to parent on Click bullet----------------------------------------
  const handleAddChildNode = (parentData) => {
    const newItem = {
      id: `${parentData.id.split("_").slice(-1)}_${generateRandomAlphanumericId(
        6
      )}`,
      text: `\u00A0`,
      children: [],
      state: true,
      level: parentData.level + 1,
    };

    let childID = newItem.id;

    const recursiveAddItem = (currentItem) => {
      if (currentItem.id == parentData.id) {
        if (currentItem.children.length) {
          childID = parentData.id;
        } else {
          childID = newItem.id;
          return {
            ...currentItem,
            children: [...currentItem.children, newItem],
          };
        }
      }
      if (currentItem.children) {
        return {
          ...currentItem,
          children: currentItem.children.map(recursiveAddItem),
        };
      }
      return currentItem;
    };
    const updatedOutline = outline.map(recursiveAddItem);
    setOutline(updatedOutline);
    // setEndOfContenteditable(document.getElementById(newItem?.id));
    router.push(`/editor/${childID}`);
  };
  //-----------------------------------------------------------------

  const findChildren = (data, targetId) => {
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

  const AddChildNodeOnPressEnter = () => {
    const selectedNode = findSelectedNode(editorRef.current);
    let previousIndex = [];
    const findParentIndex = (data, targetId) => {
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        previousIndex.push({
          id: item.id,
          text: item.text,
          state: item.state,
          level: item.level,
        });
        if (item.id == targetId) {
          if (params.id == targetId) {
            return previousIndex[previousIndex.length - 1];
          }
          if (item.level == 1 && !item.state) {
            return null;
          }
          if (item.state) {
            // Create child node of Children
            return previousIndex[previousIndex.length - 1];
          } else {
            // Create sibiling node
            const lastIndex = previousIndex[previousIndex.length - 1];
            const nodeIndex = previousIndex.findIndex(
              (item) =>
                item.level == lastIndex.level - 1 &&
                item.id.includes(lastIndex.id.split("_")[0])
            );
            return previousIndex[nodeIndex];
          }
        }
        if (item.children && item.children.length > 0) {
          const result = findParentIndex(item.children, targetId, i);
          if (result !== null) {
            return result;
          }
        }
      }
      return null;
    };

    const parentIndex = findParentIndex(outline, selectedNode.id);
    const appendNewItemAfterId = (array, targetId, newItem) => {
      const newArray = [...array];
      const index = newArray.findIndex((item) => item.id === targetId);

      if (index !== -1) {
        newArray.splice(index + 1, 0, newItem);
      }

      return newArray;
    };
    console.log("parentIndex :", parentIndex, selectedNode);
    if (parentIndex == null) {
      const newItem = {
        id: `${outline.length + 1}`,
        text: `\u00A0`,
        children: [],
        state: false,
        level: 1,
      };
      console.log(outline);
      const updatedOutline = appendNewItemAfterId(
        outline,
        selectedNode.id,
        newItem
      );
      setOutline(updatedOutline);
      setTimeout(() => {
        console.log("<><><>", document.getElementById(newItem?.id))
        setEndOfContenteditable(document.getElementById(newItem?.id));
      }, 0);
    } else {
      const parentData = findChildren(outline, parentIndex.id);

      const newItem = {
        id: `${parentData[0].id
          .split("_")
          .slice(-1)}_${generateRandomAlphanumericId(6)}`,
        text: `\u00A0`,
        children: [],
        state: true,
        level: parentData[0].level + 1,
      };

      console.log({ newItem });
      const recursiveAddItem = (currentItem) => {
        if (currentItem.id == parentData[0].id) {
          return {
            ...currentItem,
            children: [...currentItem.children, newItem],
          };
        }
        if (currentItem.children) {
          return {
            ...currentItem,
            children: currentItem.children.map(recursiveAddItem),
          };
        }
        return currentItem;
      };
      const updatedOutline = outline.map(recursiveAddItem);
      setOutline(updatedOutline);
      setTimeout(() => {
        console.log("<><><>", document.getElementById(newItem?.id))
        setEndOfContenteditable(document.getElementById(newItem?.id));
      }, 0);
    }
  };

  const addNewNode = (event) => {
    if (event.code === "Enter") {
      console.log("Enter pressed ---");
      event.preventDefault();
      AddChildNodeOnPressEnter();
    } else if (event.key === "Tab" && event.shiftKey) {
      console.log("Shift + Tab pressed");
      const selectedNode = findSelectedNode(editorRef.current);
      console.log("selected node in shift", selectedNode.id);
      console.log("outline", outline);
      if (selectedNode) {
        const parentIndex = outline.findIndex(
          (item) => item.id === selectedNode.id
        );
        if (parentIndex !== -1) {
          console.log("can not shift item");
          return;
        }
        const recursiveMoveChildItem = (currentItem, parent) => {
          if (currentItem.children) {
            const childIndex = currentItem.children.findIndex(
              (item) => item.id === selectedNode.id
            );
            if (childIndex !== -1) {
              const movedItem = currentItem.children.splice(childIndex, 1)[0];
              movedItem.id = movedItem.id.split("_")[0];
              const insertIndex = outline.indexOf(parent) + 1;
              outline.splice(insertIndex - 1, 0, movedItem);
              const updatemainIds = (item, index) => {
                item.id = `${index + 1}`;
              };
              outline.forEach((item, index) => updatemainIds(item, index));
              setOutline([...outline]);
            } else {
              currentItem.children.forEach((child) =>
                recursiveMoveChildItem(child, currentItem, parent)
              );
            }
          }
        };
        const parentItem = outline.find((item) =>
          item.children.some((child) => child.id === selectedNode.id)
        );
        if (parentItem) {
          recursiveMoveChildItem(parentItem, null);
        }
      }
    } else if (event.code === "Tab") {
      const selectedNode = findSelectedNode(editorRef.current);
      console.log("selected node", selectedNode.id);
      console.log("tab pressed ---");
      console.log("outline in tab", outline);
      if (selectedNode) {
        const parentIndex = outline.findIndex(
          (item) => item.id === selectedNode.id
        );
        if (parentIndex === 0) {
          console.log("Cannot move the first item up");
          return;
        } else if (parentIndex > 0) {
          const movedItem = outline.splice(parentIndex, 1)[0];
          movedItem.id = `${movedItem.id
            .split("_")
            .slice(-1)}_${generateRandomAlphanumericId(6)}`;
          outline[parentIndex - 1].children.push(movedItem);
          const updatemainIds = (item, index) => {
            item.id = `${index + 1}`;
          };
          outline.forEach((item, index) => updatemainIds(item, index));
          setOutline([...outline]);
        } else {
          const recursiveMovechildItem = (currentItem) => {
            if (currentItem.children) {
              const childIndex = currentItem.children.findIndex(
                (item) => item.id === selectedNode.id
              );
              if (childIndex === 0) {
                console.log("Cannot move the last child up");
                return;
              } else if (childIndex !== -1) {
                const movedItem = currentItem.children.splice(childIndex, 1)[0];
                movedItem.id = `${movedItem.id
                  .split("_")
                  .slice(-1)}_${generateRandomAlphanumericId(6)}`;
                currentItem.children[childIndex - 1].children.push(movedItem);
                setOutline([...outline]);
              } else {
                currentItem.children.forEach(recursiveMovechildItem);
              }
            }
          };
          outline.forEach(recursiveMovechildItem);
        }
      }
    }
  };

  //------------------------------------------------------------------
  // Add text in outline state
  const handleContentChange = () => {
    const selectedNode = findSelectedNode(editorRef.current);
    // console.log("selectedNode", selectedNode);
    const recursiveAddItem = (currentItem) => {
      if (currentItem.id == selectedNode?.id) {
        return { ...currentItem, text: selectedNode?.text };
      }
      if (currentItem.children) {
        return {
          ...currentItem,
          children: currentItem.children.map(recursiveAddItem),
        };
      }
      return currentItem;
    };

    const updatedOutline = outline.map(recursiveAddItem);
    setOutline(updatedOutline);
    setEndOfContenteditable(document.getElementById(selectedNode?.id));
    // console.log("<><><><><",)
  };

  // -----------------------------------------------------------------------------

  // Expand child nodes
  const handleChildRender = (parentId) => {
    const recursiveAddItem = (currentItem) => {
      if (currentItem.id === parentId) {
        if (currentItem.state) {
          return { ...currentItem, state: false };
        } else {
          return { ...currentItem, state: true };
        }
      }
      if (currentItem.children) {
        return {
          ...currentItem,
          children: currentItem.children.map(recursiveAddItem),
        };
      }
      return currentItem;
    };
    const updatedOutline = outline.map(recursiveAddItem);
    setOutline(updatedOutline);
  };
  const findSelectedNode = () => {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const selectedNode = range.startContainer.parentNode;
    const closestLi = getClosestElement(selectedNode, "li[data-id]");

    if (closestLi) {
      const nodeId = closestLi.getAttribute("data-id");
      const firstDiv = closestLi.querySelector("div:first-child");
      const nodeContent = firstDiv ? firstDiv.textContent.trim() : "";
      return { id: nodeId, text: nodeContent };
    }
    return null;
  };

  const getClosestElement = (element, selector) => {
    while (element && element !== document) {
      if (element.matches(selector)) {
        return element;
      }
      element = element.parentNode;
    }
    return null;
  };

  const setEndOfContenteditable = (contentEditableElement) => {
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(contentEditableElement);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  };


  return {
    outline,
    setOutline,
    editorRef,
    nodeRef,
    handleAddChildNode,
    addNewNode,
    handleContentChange,
    handleChildRender,
    router,
  };
};

export default useRender;
