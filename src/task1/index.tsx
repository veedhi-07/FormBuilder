import Sidebar from "../task1/components/sidebar";
import { FormProvider } from "../task1/context/useFormBuilder";
import PreviewLayout from "../task1/layout/previewlayout/index";

export default function Task1() {
  return (
    <>
      <div className="root flex flex-row">
        <FormProvider>
          <Sidebar />
          <PreviewLayout />
        </FormProvider>
      </div>
    </>
  );
}
