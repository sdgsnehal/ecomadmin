import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { fetchFromBackend } from "@/lib/fetchfromBackend";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const DeleteProductPage = () => {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [productInfo, setProductInfo] = useState(null);
  const { id } = router.query;
  useEffect(() => {
    if (!id) {
      return;
    }
    fetchFromBackend("products/" + id).then((res) => {
      setProductInfo(res.data);
    });
  }, [id]);
  function goBack() {
    router.push("/products");
  }
  async function deleteProduct() {
    await fetchFromBackend("products/" + id, { method: "DELETE" });
    goBack();
  }

  if (isMobile) {
    return (
      <Layout>
        <h1 className="text-center">
          Do you really want to delete &nbsp; {productInfo?.name}
        </h1>
        <div className="flex gap-2 justify-center">
          <button className="btn-red" onClick={deleteProduct}>
            Yes
          </button>
          <button className="btn-default" onClick={goBack}>
            No
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Dialog open onOpenChange={(open) => !open && goBack()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete product</DialogTitle>
            <DialogDescription>
              Do you really want to delete &nbsp;
              <strong>{productInfo?.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={goBack}>
              No
            </Button>
            <Button variant="destructive" onClick={deleteProduct}>
              Yes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default DeleteProductPage;
