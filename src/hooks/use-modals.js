import { markRaw, reactive } from "vue";

const useModals = (value) => {
  const modals = reactive(value);

  const openModal = (modal) => {
    closeModals();
    modals[modal] = true;
  };

  const closeModals = () => {
    Object.keys(markRaw(modals)).forEach(key => {
      modals[key] = false;
    });
  };

  return { modals, openModal, closeModals };
};

export default useModals;
